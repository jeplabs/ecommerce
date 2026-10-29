package com.jeplabs.ecommerce.domain.sucursal;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SucursalService {

    private final SucursalRepository repositorio;

    public List<DatosRespuestaSucursal> listarActivas() {
        return repositorio.findByActivoTrueOrderByOrdenVisualizacionAscIdAsc()
                .stream()
                .map(DatosRespuestaSucursal::new)
                .toList();
    }

    public List<DatosRespuestaSucursal> listarTodas() {
        return repositorio.findAllByOrderByOrdenVisualizacionAscIdAsc()
                .stream()
                .map(DatosRespuestaSucursal::new)
                .toList();
    }

    public DatosRespuestaSucursal buscarPorId(Long id) {
        return new DatosRespuestaSucursal(buscarSucursal(id));
    }

    @Transactional
    public DatosRespuestaSucursal crear(DatosCrearSucursal datos) {
        Sucursal sucursal = new Sucursal(datos);
        repositorio.save(sucursal);
        return new DatosRespuestaSucursal(sucursal);
    }

    @Transactional
    public DatosRespuestaSucursal actualizar(Long id, DatosActualizarSucursal datos) {
        Sucursal sucursal = buscarSucursal(id);
        sucursal.actualizar(datos);
        return new DatosRespuestaSucursal(sucursal);
    }

    @Transactional
    public void activar(Long id) {
        buscarSucursal(id).activar();
    }

    @Transactional
    public void desactivar(Long id) {
        buscarSucursal(id).desactivar();
    }

    private Sucursal buscarSucursal(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Sucursal no encontrada con ID: " + id));
    }
}
