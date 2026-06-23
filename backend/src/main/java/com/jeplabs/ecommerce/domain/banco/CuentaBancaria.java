package com.jeplabs.ecommerce.domain.banco;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cuentas_bancarias")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class CuentaBancaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String banco;
    private String titular;
    private String tipoCuenta;
    private String numeroCuenta;
    private String moneda;
    private boolean activo;
    private Integer ordenVisualizacion;

    public void actualizar(DatosActualizarCuentaBancaria datos) {
        if (datos.banco() != null)              this.banco = datos.banco();
        if (datos.titular() != null)            this.titular = datos.titular();
        if (datos.tipoCuenta() != null)         this.tipoCuenta = datos.tipoCuenta();
        if (datos.numeroCuenta() != null)       this.numeroCuenta = datos.numeroCuenta();
        if (datos.moneda() != null)             this.moneda = datos.moneda();
        if (datos.ordenVisualizacion() != null) this.ordenVisualizacion = datos.ordenVisualizacion();
    }

    public void activar()    { this.activo = true; }
    public void desactivar() { this.activo = false; }
}