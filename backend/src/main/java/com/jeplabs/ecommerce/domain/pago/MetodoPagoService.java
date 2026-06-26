package com.jeplabs.ecommerce.domain.pago;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MetodoPagoService {

    private final MetodoPagoRepository repositorio;

    // Público - cliente ve métodos activos
    public List<DatosRespuestaMetodoPago> listarActivos() {
        return repositorio.findByActivoTrueOrderByOrdenVisualizacionAsc()
                .stream()
                .map(DatosRespuestaMetodoPago::new)
                .toList();
    }

    // Admin - ve todos
    public List<DatosRespuestaMetodoPago> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(DatosRespuestaMetodoPago::new)
                .toList();
    }

    @Transactional
    public DatosRespuestaMetodoPago crear(DatosCrearMetodoPago datos) {
        if (repositorio.existsByCodigo(datos.codigo())) {
            throw new IllegalArgumentException(
                    "Ya existe un método de pago con el código: " + datos.codigo());
        }
        MetodoPago metodo = new MetodoPago(
                null, datos.codigo(), datos.nombre(), datos.descripcion(),
                datos.tipo(), true, datos.ordenVisualizacion(), datos.configuracion()
        );
        repositorio.save(metodo);
        return new DatosRespuestaMetodoPago(metodo);
    }

    @Transactional
    public DatosRespuestaMetodoPago actualizar(Long id, DatosActualizarMetodoPago datos) {
        MetodoPago metodo = buscarMetodo(id);
        metodo.actualizar(datos);
        return new DatosRespuestaMetodoPago(metodo);
    }

    @Transactional
    public void activar(Long id)    { buscarMetodo(id).activar(); }

    @Transactional
    public void desactivar(Long id) { buscarMetodo(id).desactivar(); }

    public MetodoPago buscarPorCodigo(String codigo) {
        return repositorio.findByCodigo(codigo)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Método de pago no encontrado: " + codigo));
    }

    private MetodoPago buscarMetodo(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Método de pago no encontrado con ID: " + id));
    }
}
