package com.jeplabs.ecommerce.domain.orden;

import com.jeplabs.ecommerce.domain.banco.CuentaBancariaRepository;
import com.jeplabs.ecommerce.domain.banco.DatosRespuestaCuentaBancaria;
import com.jeplabs.ecommerce.domain.carrito.*;
import com.jeplabs.ecommerce.domain.direccion.Direccion;
import com.jeplabs.ecommerce.domain.direccion.DireccionRepository;
import com.jeplabs.ecommerce.domain.envio.EnvioCalculator;
import com.jeplabs.ecommerce.domain.envio.ServicioEnvio;
import com.jeplabs.ecommerce.domain.envio.ServicioEnvioRepository;
import com.jeplabs.ecommerce.domain.pago.MetodoPago;
import com.jeplabs.ecommerce.domain.pago.MetodoPagoService;
import com.jeplabs.ecommerce.domain.pago.TipoMetodoPago;
import com.jeplabs.ecommerce.domain.producto.Producto;
import com.jeplabs.ecommerce.domain.producto.ProductoRepository;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import com.jeplabs.ecommerce.domain.usuario.UsuarioRepository;
import com.jeplabs.ecommerce.domain.usuario.Rol; // ← Importado
import com.jeplabs.ecommerce.infra.email.EmailService;
import com.jeplabs.ecommerce.infra.exceptions.CarritoNoEncontradoException;
import com.jeplabs.ecommerce.infra.exceptions.CarritoVacioException;
import com.jeplabs.ecommerce.infra.exceptions.OrdenNoEncontradaException;
import com.jeplabs.ecommerce.infra.exceptions.ProductoNoDisponibleException;
import com.jeplabs.ecommerce.infra.exceptions.StockInsuficienteException;
import com.jeplabs.ecommerce.infra.storage.ArchivoValidator;
import com.jeplabs.ecommerce.infra.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile; // ← Importado

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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
    private final CuentaBancariaRepository cuentaBancariaRepositorio;
    private final StorageService storageService;
    private final ArchivoValidator archivoValidator;
    private final MetodoPagoService metodoPagoService;

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
                        .orElseThrow(() -> new OrdenNoEncontradaException(ordenId))
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
                        .orElseThrow(() -> new OrdenNoEncontradaException(ordenId))
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
                .orElseThrow(() -> new IllegalArgumentException("Dirección no encontrada"));

        if (!direccion.isActivo()) {
            throw new IllegalArgumentException("La dirección seleccionada no está disponible");
        }

        // Buscar servicio de envío
        ServicioEnvio servicioEnvio = servicioEnvioRepositorio
                .findById(datos.servicioEnvioId())
                .orElseThrow(() -> new IllegalArgumentException("Servicio de envío no encontrado"));

        if (!servicioEnvio.isActivo()) {
            throw new IllegalArgumentException("El servicio de envío seleccionado no está disponible");
        }

        // Validar que express no se use con contra entrega
        servicioEnvio.validarDisponibilidad(datos.formaPagoEnvio());

        MetodoPago metodoPago = metodoPagoService.buscarPorCodigo(datos.metodoPagoCodigo());

        if (!metodoPago.isActivo()) {
            throw new IllegalArgumentException(
                    "El método de pago seleccionado no está disponible");
        }

        try {
            List<OrdenItem> ordenItems = new ArrayList<>();
            BigDecimal subtotal = BigDecimal.ZERO;

            // Se calcula costo inicial provisional y se mapea completo el constructor incluyendo metodoPago
            BigDecimal costoEnvio = envioCalculator.calcularCostoEnvio(subtotal, servicioEnvio, datos.formaPagoEnvio());

            Orden orden = new Orden(
                    usuario, direccion, servicioEnvio,
                    datos.formaPagoEnvio(),
                    datos.metodoPagoCodigo(),
                    BigDecimal.ZERO, datos.notas(),
                    BigDecimal.ZERO, BigDecimal.ZERO
            );
            ordenRepositorio.save(orden);

            for (CarritoItem carritoItem : carrito.getItems()) {
                Producto producto = productoRepositorio
                        .findById(carritoItem.getProducto().getId())
                        .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

                if (!producto.getEstado().esComprable()) {
                    throw new ProductoNoDisponibleException(producto.getNombre());
                }

                if (producto.getStock() < carritoItem.getCantidad()) {
                    throw new StockInsuficienteException(producto.getNombre(), producto.getStock());
                }

                BigDecimal precioUnitario = carritoItem.getPrecioUnitario();
                BigDecimal precioBase     = ivaCalculator.extraerPrecioBase(precioUnitario);
                BigDecimal ivaUnitario    = ivaCalculator.extraerIva(precioUnitario);

                OrdenItem ordenItem = new OrdenItem(
                        orden, producto, carritoItem.getCantidad(),
                        precioUnitario, precioBase, ivaUnitario
                );
                ordenItems.add(ordenItem);

                producto.descontarStock(carritoItem.getCantidad());
                productoRepositorio.save(producto);

                subtotal = subtotal.add(ordenItem.getSubtotal());
            }

            // Recalcular costo de envío con subtotal real y desglosar IVA
            costoEnvio = envioCalculator.calcularCostoEnvio(subtotal, servicioEnvio, datos.formaPagoEnvio());
            BigDecimal ivaProductos = ivaCalculator.calcularIvaTotal(subtotal);
            BigDecimal ivaEnvio     = ivaCalculator.extraerIva(costoEnvio);
            BigDecimal ivaTotal     = ivaProductos.add(ivaEnvio);

            // Actualizar totales de la orden de forma definitiva
            orden.actualizarTotales(subtotal, ivaTotal, costoEnvio);

            itemRepositorio.saveAll(ordenItems);
            orden.getItems().addAll(ordenItems);

            // Marcar carrito como convertido y vaciarlo
            carritoItemRepositorio.deleteAll(carrito.getItems());
            carrito.getItems().clear();
            carrito.marcarComoConvertido();

            // Lógica de notificaciones unificada después de calcular los montos reales
            if (metodoPago.getTipo() == TipoMetodoPago.TRANSFERENCIA) {
                List<DatosRespuestaCuentaBancaria> cuentas = cuentaBancariaRepositorio
                        .findByActivoTrueOrderByOrdenVisualizacionAsc()
                        .stream()
                        .map(DatosRespuestaCuentaBancaria::new)
                        .toList();

                emailService.enviarDatosBancarios(
                        usuario.getEmail(),
                        usuario.getNombre(),
                        orden.getId(),
                        orden.getTotal(),
                        cuentas
                );
            } else {
                emailService.enviarConfirmacionOrden(
                        usuario.getEmail(),
                        usuario.getNombre(),
                        orden.getId()
                );
            }

            return new DatosRespuestaOrden(orden);

        } catch (ObjectOptimisticLockingFailureException e) {
            throw new IllegalArgumentException(
                    "Uno o más productos fueron modificados durante el proceso. Por favor intenta nuevamente"
            );
        }
    }

    // Cliente cancela su propia orden
    @Transactional
    public DatosRespuestaOrden cancelarMiOrden(String email, Long ordenId) {
        Usuario usuario = buscarUsuario(email);
        Orden orden = ordenRepositorio.findByIdAndUsuarioId(ordenId, usuario.getId())
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada con ID: " + ordenId));
        
        if (orden.getEstado() == EstadoOrden.PENDIENTE) {
            orden.cancelar(); // Pasa a CANCELADA
            devolverStock(orden);
        } else if (orden.getEstado() == EstadoOrden.CONFIRMADA) {
            // Caso 3: Orden ya pagada. Pasa a ANULADO en espera de que Admin apruebe reembolso.
            // NO se devuelve el stock inmediatamente.
            orden.cambiarEstado(EstadoOrden.ANULADO);
        } else {
            throw new com.jeplabs.ecommerce.infra.exceptions.EstadoInvalidoException(orden.getEstado().name(), "CANCELADA");
        }
        
        return new DatosRespuestaOrden(orden);
    }

    // Admin cambia estado de una orden
    @Transactional
    public DatosRespuestaOrden cambiarEstado(Long ordenId, DatosActualizarEstadoOrden datos) {
        Orden orden = buscarOrden(ordenId);

        if (datos.estado() == EstadoOrden.CANCELADA) {
            if (orden.getEstado() == EstadoOrden.PENDIENTE) {
                orden.cancelar();
                devolverStock(orden);
            } else {
                throw new com.jeplabs.ecommerce.infra.exceptions.EstadoInvalidoException(orden.getEstado().name(), "CANCELADA");
            }
        } else if (datos.estado() == EstadoOrden.ANULADO) {
            orden.cambiarEstado(EstadoOrden.ANULADO);
        } else {
            orden.cambiarEstado(datos.estado());
        }

        return new DatosRespuestaOrden(orden);
    }

    // Completar el flujo de reembolso una vez ejecutado en Transbank (Caso 3)
    @Transactional
    public void completarReembolso(Long ordenId) {
        Orden orden = buscarOrden(ordenId);
        orden.cambiarEstado(EstadoOrden.REEMBOLSADO);
        devolverStock(orden); // Ahora sí devolvemos el stock al inventario
        ordenRepositorio.save(orden);
    }

    // Expiración automática ejecutada por el Scheduler (Caso 4)
    @Transactional
    public void expiracionAutomatica(Orden orden) {
        orden.cancelar();        // PENDIENTE -> CANCELADA
        devolverStock(orden);    // Devuelve los productos al inventario
        ordenRepositorio.save(orden);
    }

    private void devolverStock(Orden orden) {
        for (OrdenItem item : orden.getItems()) {
            Producto producto = productoRepositorio.findById(item.getProducto().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
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

    // Subir comprobante
    @Transactional
    public DatosRespuestaOrden subirComprobante(String email, Long ordenId, MultipartFile archivo) {
        archivoValidator.validar(archivo);

        Usuario usuario = buscarUsuario(email);
        Orden orden = ordenRepositorio.findByIdAndUsuarioId(ordenId, usuario.getId())
                .orElseThrow(() -> new OrdenNoEncontradaException(ordenId));

        if (orden.getEstado() == EstadoOrden.CANCELADA) {
            throw new IllegalArgumentException("No se puede subir comprobante a una orden cancelada");
        }

        if (orden.getMetodoPago() == null ||
                orden.getMetodoPago().getTipo() != TipoMetodoPago.TRANSFERENCIA) {
            throw new IllegalArgumentException(
                    "Esta orden no requiere comprobante de transferencia");
        }

        if (orden.getComprobanteUrl() != null) {
            storageService.eliminar(orden.getComprobanteUrl());
        }

        String url = storageService.guardar(archivo, "comprobantes");
        orden.agregarComprobante(url, archivo.getOriginalFilename());

        usuarioRepositorio.findByRolAndActivo(Rol.ROLE_ADMIN, true)
                .forEach(admin -> emailService.enviarNotificacionComprobante(
                        admin.getEmail(), orden.getId(),
                        usuario.getNombre() + " " + usuario.getApellido()
                ));

        return new DatosRespuestaOrden(orden);
    }
}