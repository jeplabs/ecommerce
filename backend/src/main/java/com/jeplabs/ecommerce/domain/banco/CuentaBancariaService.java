package com.jeplabs.ecommerce.domain.banco;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CuentaBancariaService {

    private final CuentaBancariaRepository repositorio;

    public List<DatosRespuestaCuentaBancaria> listarActivas() {
        return repositorio.findByActivoTrueOrderByOrdenVisualizacionAsc()
                .stream()
                .map(DatosRespuestaCuentaBancaria::new)
                .toList();
    }

    public List<DatosRespuestaCuentaBancaria> listarTodas() {
        return repositorio.findAll()
                .stream()
                .map(DatosRespuestaCuentaBancaria::new)
                .toList();
    }

    @Transactional
    public DatosRespuestaCuentaBancaria crear(DatosCrearCuentaBancaria datos) {
        CuentaBancaria cuenta = new CuentaBancaria(
                null, datos.banco(), datos.titular(),
                datos.tipoCuenta(), datos.numeroCuenta(),
                datos.moneda(), true, datos.ordenVisualizacion()
        );
        repositorio.save(cuenta);
        return new DatosRespuestaCuentaBancaria(cuenta);
    }

    @Transactional
    public DatosRespuestaCuentaBancaria actualizar(Long id, DatosActualizarCuentaBancaria datos) {
        CuentaBancaria cuenta = buscarCuenta(id);
        cuenta.actualizar(datos);
        return new DatosRespuestaCuentaBancaria(cuenta);
    }

    @Transactional
    public void activar(Long id)    { buscarCuenta(id).activar(); }

    @Transactional
    public void desactivar(Long id) { buscarCuenta(id).desactivar(); }

    private CuentaBancaria buscarCuenta(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Cuenta bancaria no encontrada con ID: " + id));
    }
}