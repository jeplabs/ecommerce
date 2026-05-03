package com.jeplabs.ecommerce.domain.carrito;

import com.jeplabs.ecommerce.domain.producto.EstadoProducto;
import com.jeplabs.ecommerce.domain.producto.Producto;
import com.jeplabs.ecommerce.domain.producto.ProductoRepository;
import com.jeplabs.ecommerce.domain.producto.PrecioHistorialRepository;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import com.jeplabs.ecommerce.domain.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

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

    // Ver carrito activo del usuario, si no existe lo crea
    @Transactional
    public DatosRespuestaCarrito verOCrearCarrito(String email) {
        Usuario usuario = buscarUsuario(email);
        Carrito carrito = obtenerOCrearCarritoActivo(usuario);
        return new DatosRespuestaCarrito(carrito);
    }

    // Agregar producto al carrito
    @Transactional
    public DatosRespuestaCarrito agregarItem(String email, DatosAgregarItem datos) {
        Usuario usuario = buscarUsuario(email);
        Carrito carrito = obtenerOCrearCarritoActivo(usuario);
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

        carrito.actualizarFecha();
        carrito.renovarExpiracion(expiracionMinutos);  // renovar al agregar items
        return new DatosRespuestaCarrito(carrito);
    }

    // Actualizar cantidad de un item
    @Transactional
    public DatosRespuestaCarrito actualizarCantidad(String email, Long itemId, DatosActualizarCantidad datos) {
        Carrito carrito = obtenerCarritoActivo(email);

        CarritoItem item = buscarItemDelCarrito(itemId, carrito.getId());
        validarStock(item.getProducto(), datos.cantidad());

        item.actualizarCantidad(datos.cantidad());
        carrito.actualizarFecha();

        return new DatosRespuestaCarrito(carrito);
    }

    // Eliminar un producto específico del carrito
    @Transactional
    public DatosRespuestaCarrito eliminarItem(String email, Long itemId) {
        Carrito carrito = obtenerCarritoActivo(email);
        CarritoItem item = buscarItemDelCarrito(itemId, carrito.getId());

        carrito.getItems().remove(item);
        itemRepositorio.delete(item);
        carrito.actualizarFecha();

        return new DatosRespuestaCarrito(carrito);
    }

    // Vaciar el carrito completo
    @Transactional
    public DatosRespuestaCarrito vaciarCarrito(String email) {
        Carrito carrito = obtenerCarritoActivo(email);

        itemRepositorio.deleteAll(carrito.getItems());
        carrito.getItems().clear();
        carrito.actualizarFecha();

        return new DatosRespuestaCarrito(carrito);
    }

    // Abandonar el carrito
    @Transactional
    public void abandonarCarrito(String email) {
        Carrito carrito = obtenerCarritoActivo(email);
        carrito.marcarComoAbandonado();
    }

    // Métodos privados reutilizables
    private Usuario buscarUsuario(String email) {
        return usuarioRepositorio.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    private Carrito obtenerOCrearCarritoActivo(Usuario usuario) {
        return carritoRepositorio
                .findByUsuarioIdAndEstado(usuario.getId(), EstadoCarrito.ACTIVO)
                .orElseGet(() -> {
                    Carrito nuevo = new Carrito(usuario);
                    nuevo.renovarExpiracion(expiracionMinutos);  // Se establece las horas correctas de expiracion
                    return carritoRepositorio.save(nuevo);
                });
    }

    private Carrito obtenerCarritoActivo(String email) {
        Usuario usuario = buscarUsuario(email);
        return carritoRepositorio
                .findByUsuarioIdAndEstado(usuario.getId(), EstadoCarrito.ACTIVO)
                .orElseThrow(() -> new IllegalArgumentException("No tienes un carrito activo"));
    }

    private Producto buscarProductoDisponible(Long productoId) {
        Producto producto = productoRepositorio.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Producto no encontrado con ID: " + productoId));
        if (!producto.getEstado().esComprable()) {
            throw new IllegalArgumentException(
                    "El producto no está disponible para compra");
        }
        return producto;
    }

    private void validarStock(Producto producto, Integer cantidad) {
        if (producto.getStock() < cantidad) {
            throw new IllegalArgumentException(
                    "Stock insuficiente. Stock disponible: " + producto.getStock());
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
