package com.jeplabs.ecommerce.domain.orden;

import com.jeplabs.ecommerce.domain.carrito.*;
import com.jeplabs.ecommerce.domain.direccion.Direccion;
import com.jeplabs.ecommerce.domain.direccion.DireccionRepository;
import com.jeplabs.ecommerce.domain.envio.EnvioCalculator;
import com.jeplabs.ecommerce.domain.envio.ServicioEnvio;
import com.jeplabs.ecommerce.domain.envio.ServicioEnvioRepository;
import com.jeplabs.ecommerce.domain.producto.Producto;
import com.jeplabs.ecommerce.domain.producto.ProductoRepository;
import com.jeplabs.ecommerce.domain.producto.EstadoProducto;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import com.jeplabs.ecommerce.domain.usuario.UsuarioRepository;
import com.jeplabs.ecommerce.infra.email.EmailService;
import com.jeplabs.ecommerce.infra.exceptions.CarritoNoEncontradoException;
import com.jeplabs.ecommerce.infra.exceptions.CarritoVacioException;
import com.jeplabs.ecommerce.infra.exceptions.OrdenNoEncontradaException;
import com.jeplabs.ecommerce.infra.exceptions.ProductoNoDisponibleException;
import com.jeplabs.ecommerce.infra.exceptions.StockInsuficienteException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrdenService {

    private final OrdenRepository ordenRepositorio;
    private final OrdenItemRepository itemRepositorio;
    private final CarritoRepository carritoRepositorio;
    private final CarritoItemRepository carritoItemRepositorio;
    private final ProductoRepository productoRepositorio;
    private final DireccionRepository direccionRepositorio;
    private final UsuarioRepository usuarioRepositorio;
    private final IvaCalculator ivaCalculator;
    private final EmailService emailService;
    private final ServicioEnvioRepository servicioEnvioRepositorio;
    private final EnvioCalculator envioCalculator;

    // Cliente lista sus propias órdenes
    public Page<DatosRespuestaOrden> listarMisOrdenes(String email, Pageable pageable) {
        Usuario usuario = buscarUsuario(email);
        return ordenRepositorio
                .findByUsuarioIdOrderByCreadoAtDesc(usuario.getId(), pageable)
                .map(DatosRespuestaOrden::new);
    }

    // Cliente ve el detalle de una orden propia
    public DatosRespuestaOrden buscarMiOrden(String email, Long ordenId) {
        Usuario usuario = buscarUsuario(email);
        return new DatosRespuestaOrden(
                ordenRepositorio.findByIdAndUsuarioId(ordenId, usuario.getId())
                        .orElseThrow(() -> new OrdenNoEncontradaException(ordenId)) // ← específica
        );
    }

    // Admin lista todas las órdenes
    public Page<DatosRespuestaOrden> listarTodas(EstadoOrden estado, Pageable pageable) {
        return ordenRepositorio.buscarTodas(estado, pageable)
                .map(DatosRespuestaOrden::new);
    }

    // Admin ve cualquier orden
    public DatosRespuestaOrden buscarPorId(Long ordenId) {

        return new DatosRespuestaOrden(
                ordenRepositorio.findById(ordenId)
                        .orElseThrow(() -> new OrdenNoEncontradaException(ordenId)) // ← específica
        );
    }

    @Transactional
    public DatosRespuestaOrden crear(String email, DatosCrearOrden datos) {
        Usuario usuario = buscarUsuario(email);

        // Verificar que tiene carrito activo con items
        Carrito carrito = carritoRepositorio
                .findByUsuarioIdAndEstado(usuario.getId(), EstadoCarrito.ACTIVO)
                .orElseThrow(CarritoNoEncontradoException::new);

        if (carrito.getItems().isEmpty()) {
            throw new CarritoVacioException();
        }

        // Verificar que la dirección existe y pertenece al usuario
        Direccion direccion = direccionRepositorio
                .findByIdAndUsuarioId(datos.direccionId(), usuario.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Dirección no encontrada"));

        if (!direccion.isActivo()) {
            throw new IllegalArgumentException(
                    "La dirección seleccionada no está disponible");
        }

        // Buscar servicio de envío
        ServicioEnvio servicioEnvio = servicioEnvioRepositorio
                .findById(datos.servicioEnvioId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Servicio de envío no encontrado"));

        if (!servicioEnvio.isActivo()) {
            throw new IllegalArgumentException(
                    "El servicio de envío seleccionado no está disponible");
        }

        try {
            // Verificar stock y preparar items con Optimistic Locking
            List<OrdenItem> ordenItems = new ArrayList<>();
            BigDecimal subtotal = BigDecimal.ZERO;

            // Datos forma de pago
            BigDecimal costoEnvio = envioCalculator.calcularCostoEnvio(
                    subtotal, servicioEnvio, datos.formaPago());

            Orden orden = new Orden(usuario, direccion, servicioEnvio,
                    datos.formaPago(), BigDecimal.ZERO, datos.notas(),
                    BigDecimal.ZERO, BigDecimal.ZERO);
            ordenRepositorio.save(orden);

            for (CarritoItem carritoItem : carrito.getItems()) {
                Producto producto = productoRepositorio
                        .findById(carritoItem.getProducto().getId())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Producto no encontrado"));

                // Verificar que el producto sigue disponible
                if (!producto.getEstado().esComprable()) {
                    throw new ProductoNoDisponibleException(producto.getNombre());
                }

                // Verificar stock suficiente
                if (producto.getStock() < carritoItem.getCantidad()) {
                    throw new StockInsuficienteException( // ← específica
                            producto.getNombre(), producto.getStock());
                }

                // Calcular desglose de IVA por item
                BigDecimal precioUnitario = carritoItem.getPrecioUnitario();
                BigDecimal precioBase     = ivaCalculator.extraerPrecioBase(precioUnitario);
                BigDecimal ivaUnitario    = ivaCalculator.extraerIva(precioUnitario);

                OrdenItem ordenItem = new OrdenItem(
                        orden, producto, carritoItem.getCantidad(),
                        precioUnitario, precioBase, ivaUnitario
                );
                ordenItems.add(ordenItem);

                // Descontar stock con Optimistic Locking
                producto.descontarStock(carritoItem.getCantidad());
                productoRepositorio.save(producto);

                subtotal = subtotal.add(ordenItem.getSubtotal());
            }

            // A partir de aquí se calculan los totales, hasta la linea orden.getItems().addAll(ordenItems)
            // Recalcular costo de envío con subtotal real
            costoEnvio = envioCalculator.calcularCostoEnvio(
                    subtotal, servicioEnvio, datos.formaPago());

            // Extraer IVA de productos y del costo de envío por separado
            BigDecimal ivaProductos = ivaCalculator.calcularIvaTotal(subtotal);
            BigDecimal ivaEnvio     = ivaCalculator.extraerIva(costoEnvio);
            BigDecimal ivaTotal     = ivaProductos.add(ivaEnvio);

            // Actualizar totales de la orden
            orden.actualizarTotales(subtotal, ivaTotal, costoEnvio);

            itemRepositorio.saveAll(ordenItems);
            orden.getItems().addAll(ordenItems);

            // Marcar carrito como convertido y vaciarlo
            carritoItemRepositorio.deleteAll(carrito.getItems());
            carrito.getItems().clear();
            carrito.marcarComoConvertido();

            // Enviar email de confirmación
            emailService.enviarConfirmacionOrden(
                    usuario.getEmail(),
                    usuario.getNombre(),
                    orden.getId()
            );

            // return new DatosRespuestaOrden(ordenRepositorio.findById(orden.getId()).orElseThrow());
            return new DatosRespuestaOrden(orden);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new IllegalArgumentException(
                    "Uno o más productos fueron modificados durante el proceso. " +
                            "Por favor intenta nuevamente");
        }
    }

    // Cliente cancela su propia orden
    @Transactional
    public DatosRespuestaOrden cancelarMiOrden(String email, Long ordenId) {
        Usuario usuario = buscarUsuario(email);
        Orden orden = ordenRepositorio.findByIdAndUsuarioId(ordenId, usuario.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Orden no encontrada con ID: " + ordenId));
        orden.cancelar();
        devolverStock(orden);
        return new DatosRespuestaOrden(orden);
    }

    // Admin cambia estado de una orden
    @Transactional
    public DatosRespuestaOrden cambiarEstado(Long ordenId, DatosActualizarEstadoOrden datos) {
        Orden orden = buscarOrden(ordenId);

        if (datos.estado() == EstadoOrden.CANCELADA) {
            orden.cancelar();
            devolverStock(orden);
        } else {
            orden.cambiarEstado(datos.estado());
        }

        return new DatosRespuestaOrden(orden);
    }

    // Devuelve el stock al cancelar una orden
    private void devolverStock(Orden orden) {
        for (OrdenItem item : orden.getItems()) {
            Producto producto = productoRepositorio.findById(item.getProducto().getId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Producto no encontrado"));
            producto.devolverStock(item.getCantidad());
            productoRepositorio.save(producto);
        }
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepositorio.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    private Orden buscarOrden(Long id) {
        return ordenRepositorio.findById(id)
                .orElseThrow(() -> new OrdenNoEncontradaException(id));
    }
}
