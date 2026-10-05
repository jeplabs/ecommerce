package com.jeplabs.ecommerce.domain.carrito;

import com.jeplabs.ecommerce.domain.producto.EstadoProducto;
import com.jeplabs.ecommerce.domain.producto.Producto;
import com.jeplabs.ecommerce.domain.producto.ProductoRepository;
import com.jeplabs.ecommerce.domain.producto.PrecioHistorialRepository;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import com.jeplabs.ecommerce.domain.usuario.UsuarioRepository;
import com.jeplabs.ecommerce.infra.exceptions.CarritoExpiradoException;
import com.jeplabs.ecommerce.infra.exceptions.CarritoNoEncontradoException;
import com.jeplabs.ecommerce.infra.exceptions.ProductoNoDisponibleException;
import com.jeplabs.ecommerce.infra.exceptions.StockInsuficienteException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoRepository carritoRepositorio;
    private final CarritoItemRepository itemRepositorio;
    private final ProductoRepository productoRepositorio;
    private final PrecioHistorialRepository precioRepositorio;
    private final UsuarioRepository usuarioRepositorio;

    @Value("${api.carrito.expiracion-minutos}")
    private long expiracionMinutos;

    @Value("${api.carrito.notificacion-minutos-antes:10}")
    private long notificacionMinutosAntes;

    private record ResultadoCarrito(Carrito carrito, boolean carritoAnteriorExpirado) {}

    // Ver carrito activo del usuario, si no existe o expiró lo crea automáticamente
    @Transactional
    public DatosRespuestaCarrito verOCrearCarrito(String email) {
        Usuario usuario = buscarUsuario(email);
        ResultadoCarrito resultado = obtenerOCrearCarritoVigente(usuario);
        return mapearRespuesta(resultado.carrito(), resultado.carritoAnteriorExpirado());
    }

    // Agregar producto al carrito (crea uno nuevo si el previo expiró)
    @Transactional
    public DatosRespuestaCarrito agregarItem(String email, DatosAgregarItem datos) {
        Usuario usuario = buscarUsuario(email);
        ResultadoCarrito resultado = obtenerOCrearCarritoVigente(usuario);
        Carrito carrito = resultado.carrito();
        Producto producto = buscarProductoDisponible(datos.productoId());

        validarStock(producto, datos.cantidad());

        // Si el producto ya está en el carrito, suma la cantidad
        itemRepositorio.findByCarritoIdAndProductoId(carrito.getId(), producto.getId())
                .ifPresentOrElse(
                        item -> {
                            int nuevaCantidad = item.getCantidad() + datos.cantidad();
                            validarStock(producto, nuevaCantidad);
                            item.actualizarCantidad(nuevaCantidad);
                        },
                        () -> {
                            BigDecimal precio = obtenerPrecioActual(producto);
                            CarritoItem nuevoItem = new CarritoItem(carrito, producto, datos.cantidad(), precio);
                            carrito.getItems().add(nuevoItem);
                            itemRepositorio.save(nuevoItem);
                        }
                );

        carrito.registrarActividad(expiracionMinutos);
        return mapearRespuesta(carrito, resultado.carritoAnteriorExpirado());
    }

    // Actualizar cantidad de un item con sliding expiration y control estricto de expiración
    @Transactional
    public DatosRespuestaCarrito actualizarCantidad(String email, Long itemId, DatosActualizarCantidad datos) {
        Carrito carrito = obtenerCarritoVigenteOFallar(email);

        CarritoItem item = buscarItemDelCarrito(itemId, carrito.getId());
        validarStock(item.getProducto(), datos.cantidad());

        item.actualizarCantidad(datos.cantidad());
        carrito.registrarActividad(expiracionMinutos);

        return mapearRespuesta(carrito, false);
    }

    // Eliminar un producto específico del carrito con sliding expiration
    @Transactional
    public DatosRespuestaCarrito eliminarItem(String email, Long itemId) {
        Carrito carrito = obtenerCarritoVigenteOFallar(email);
        CarritoItem item = buscarItemDelCarrito(itemId, carrito.getId());

        carrito.getItems().remove(item);
        itemRepositorio.delete(item);
        carrito.registrarActividad(expiracionMinutos);

        return mapearRespuesta(carrito, false);
    }

    // Vaciar el carrito completo
    @Transactional
    public DatosRespuestaCarrito vaciarCarrito(String email) {
        Carrito carrito = obtenerCarritoVigenteOFallar(email);

        itemRepositorio.deleteAll(carrito.getItems());
        carrito.getItems().clear();
        carrito.registrarActividad(expiracionMinutos);

        return mapearRespuesta(carrito, false);
    }

    // Extender manualmente el tiempo de vida del carrito (renovación)
    @Transactional
    public DatosRespuestaCarrito renovar(String email) {
        Carrito carrito = obtenerCarritoVigenteOFallar(email);
        carrito.renovarExpiracion(expiracionMinutos);
        return mapearRespuesta(carrito, false);
    }

    // Restaurar productos del último carrito expirado al carrito activo con stock y precio vigente
    @Transactional
    public DatosRespuestaRestauracion restaurar(String email) {
        Usuario usuario = buscarUsuario(email);

        Carrito carritoExpirado = carritoRepositorio
                .findFirstByUsuarioIdAndEstadoOrderByActualizadoAtDesc(usuario.getId(), EstadoCarrito.EXPIRADO)
                .orElseThrow(() -> new IllegalArgumentException("No hay ningún carrito expirado para restaurar"));

        ResultadoCarrito resultadoActivo = obtenerOCrearCarritoVigente(usuario);
        Carrito carritoActivo = resultadoActivo.carrito();

        List<DatosRespuestaRestauracion.ItemNoRestaurado> noRestaurados = new ArrayList<>();

        for (CarritoItem itemViejo : carritoExpirado.getItems()) {
            Producto prod = productoRepositorio.findById(itemViejo.getProducto().getId()).orElse(null);

            if (prod == null || !prod.getEstado().esComprable()) {
                noRestaurados.add(new DatosRespuestaRestauracion.ItemNoRestaurado(
                        itemViejo.getProducto().getId(),
                        itemViejo.getProducto().getNombre(),
                        "NO_DISPONIBLE",
                        itemViejo.getCantidad(),
                        0
                ));
                continue;
            }

            if (prod.getStock() <= 0) {
                noRestaurados.add(new DatosRespuestaRestauracion.ItemNoRestaurado(
                        prod.getId(),
                        prod.getNombre(),
                        "SIN_STOCK",
                        itemViejo.getCantidad(),
                        0
                ));
                continue;
            }

            BigDecimal precioActual;
            try {
                precioActual = obtenerPrecioActual(prod);
            } catch (Exception e) {
                noRestaurados.add(new DatosRespuestaRestauracion.ItemNoRestaurado(
                        prod.getId(),
                        prod.getNombre(),
                        "SIN_PRECIO",
                        itemViejo.getCantidad(),
                        0
                ));
                continue;
            }

            int cantidadDeseada = itemViejo.getCantidad();
            int cantidadARestaurar = Math.min(cantidadDeseada, prod.getStock());

            if (cantidadARestaurar < cantidadDeseada) {
                noRestaurados.add(new DatosRespuestaRestauracion.ItemNoRestaurado(
                        prod.getId(),
                        prod.getNombre(),
                        "STOCK_PARCIAL",
                        cantidadDeseada,
                        cantidadARestaurar
                ));
            }

            itemRepositorio.findByCarritoIdAndProductoId(carritoActivo.getId(), prod.getId())
                    .ifPresentOrElse(
                            itemActivo -> {
                                int finalCantidad = Math.min(itemActivo.getCantidad() + cantidadARestaurar, prod.getStock());
                                itemActivo.actualizarCantidad(finalCantidad);
                            },
                            () -> {
                                CarritoItem nuevo = new CarritoItem(carritoActivo, prod, cantidadARestaurar, precioActual);
                                carritoActivo.getItems().add(nuevo);
                                itemRepositorio.save(nuevo);
                            }
                    );
        }

        // Marcar el carrito viejo como ABANDONADO para garantizar idempotencia
        carritoExpirado.marcarComoAbandonado();
        carritoActivo.registrarActividad(expiracionMinutos);

        return new DatosRespuestaRestauracion(mapearRespuesta(carritoActivo, false), noRestaurados);
    }

    // Abandonar el carrito
    @Transactional
    public void abandonarCarrito(String email) {
        Carrito carrito = obtenerCarritoActivo(email);
        carrito.marcarComoAbandonado();
    }

    // Métodos privados auxiliares
    private DatosRespuestaCarrito mapearRespuesta(Carrito carrito, boolean carritoAnteriorExpirado) {
        DatosExpiracionCarrito expiracion = new DatosExpiracionCarrito(
                carrito, expiracionMinutos, notificacionMinutosAntes, carritoAnteriorExpirado);
        return new DatosRespuestaCarrito(carrito, expiracion);
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepositorio.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    private ResultadoCarrito obtenerOCrearCarritoVigente(Usuario usuario) {
        return carritoRepositorio
                .findByUsuarioIdAndEstado(usuario.getId(), EstadoCarrito.ACTIVO)
                .map(c -> {
                    if (!c.estaExpirado()) {
                        return new ResultadoCarrito(c, false);
                    }
                    c.marcarComoExpirado();
                    carritoRepositorio.save(c);
                    Carrito nuevo = crearNuevoCarrito(usuario);
                    return new ResultadoCarrito(nuevo, true);
                })
                .orElseGet(() -> new ResultadoCarrito(crearNuevoCarrito(usuario), false));
    }

    private Carrito crearNuevoCarrito(Usuario usuario) {
        Carrito nuevo = new Carrito(usuario);
        nuevo.renovarExpiracion(expiracionMinutos);
        return carritoRepositorio.save(nuevo);
    }

    private Carrito obtenerCarritoActivo(String email) {
        Usuario usuario = buscarUsuario(email);
        return carritoRepositorio
                .findByUsuarioIdAndEstado(usuario.getId(), EstadoCarrito.ACTIVO)
                .orElseThrow(CarritoNoEncontradoException::new);
    }

    private Carrito obtenerCarritoVigenteOFallar(String email) {
        Carrito c = obtenerCarritoActivo(email);
        if (c.estaExpirado()) {
            throw new CarritoExpiradoException();
        }
        return c;
    }

    private Producto buscarProductoDisponible(Long productoId) {
        Producto producto = productoRepositorio.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Producto no encontrado con ID: " + productoId));
        if (!producto.getEstado().esComprable()) {
            throw new ProductoNoDisponibleException(producto.getNombre());
        }
        return producto;
    }

    private void validarStock(Producto producto, Integer cantidad) {
        if (producto.getStock() < cantidad) {
            throw new StockInsuficienteException(producto.getNombre(), producto.getStock());
        }
    }

    private BigDecimal obtenerPrecioActual(Producto producto) {
        return precioRepositorio.findByProductoIdAndFechaFinIsNull(producto.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "El producto no tiene precio definido"))
                .getPrecioVenta();
    }

    private CarritoItem buscarItemDelCarrito(Long itemId, Long carritoId) {
        return itemRepositorio.findByIdAndCarritoId(itemId, carritoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Item no encontrado en el carrito"));
    }
}
