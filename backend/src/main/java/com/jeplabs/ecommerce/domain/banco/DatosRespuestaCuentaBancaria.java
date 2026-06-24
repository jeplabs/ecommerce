package com.jeplabs.ecommerce.domain.banco;

public record DatosRespuestaCuentaBancaria(
        Long id,
        String banco,
        String titular,
        String tipoCuenta,
        String numeroCuenta,
        String moneda,
        boolean activo,
        Integer ordenVisualizacion
) {
    public DatosRespuestaCuentaBancaria(CuentaBancaria cuenta) {
        this(
                cuenta.getId(),
                cuenta.getBanco(),
                cuenta.getTitular(),
                cuenta.getTipoCuenta(),
                cuenta.getNumeroCuenta(),
                cuenta.getMoneda(),
                cuenta.isActivo(),
                cuenta.getOrdenVisualizacion()
        );
    }
}