package com.jeplabs.ecommerce.domain.envio;

import com.jeplabs.ecommerce.domain.orden.FormaPago;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioEnvioService {

    private final ServicioEnvioRepository repositorio;
    private final EnvioCalculator envioCalculator;

    // Lista servicios activos con costos calculados según subtotal
    public DatosRespuestaOpcionesEnvio listarOpcionesEnvio(BigDecimal subtotal) {
        List<ServicioEnvio> servicios = repositorio.findByActivoTrue();
        boolean envioGratis = envioCalculator.aplicaEnvioGratis(subtotal);

        List<DatosRespuestaServicioEnvio> opciones = servicios.stream()
                .map(DatosRespuestaServicioEnvio::new)
                .toList();

        return new DatosRespuestaOpcionesEnvio(
                envioGratis,
                envioGratis ? BigDecimal.ZERO : null,
                envioCalculator.getMontoMinimoGratis(),
                opciones
        );
    }

    public DatosRespuestaServicioEnvio buscarPorId(Long id) {
        return new DatosRespuestaServicioEnvio(buscarServicio(id));
    }

    @Transactional
    public DatosRespuestaServicioEnvio crear(DatosCrearServicioEnvio datos) {
        ServicioEnvio servicio = new ServicioEnvio(
                null,
                datos.nombre(),
                datos.descripcion(),
                datos.tarifa(),
                datos.recargoContraEntrega(),
                true,
                datos.logoUrl()
        );
        repositorio.save(servicio);
        return new DatosRespuestaServicioEnvio(servicio);
    }

    @Transactional
    public DatosRespuestaServicioEnvio actualizar(Long id, DatosActualizarServicioEnvio datos) {
        ServicioEnvio servicio = buscarServicio(id);
        servicio.actualizar(datos);
        return new DatosRespuestaServicioEnvio(servicio);
    }

    @Transactional
    public void desactivar(Long id) {
        buscarServicio(id).desactivar();
    }

    @Transactional
    public void activar(Long id) {
        buscarServicio(id).activar();
    }

    private ServicioEnvio buscarServicio(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Servicio de envío no encontrado con ID: " + id));
    }
}