package com.jeplabs.ecommerce.domain.envio;

import com.jeplabs.ecommerce.domain.orden.FormaPagoEnvio;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "servicios_envio")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class ServicioEnvio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;

    @Column(name = "tarifa", precision = 10, scale = 2)
    private BigDecimal tarifa;

    @Column(name = "recargo_contra_entrega", precision = 10, scale = 2)
    private BigDecimal recargoContraEntrega;

    private boolean activo;
    private String logoUrl;
    private boolean servicioExpress;

    public void actualizar(DatosActualizarServicioEnvio datos) {
        if (datos.nombre() != null)                 this.nombre = datos.nombre();
        if (datos.descripcion() != null)            this.descripcion = datos.descripcion();
        if (datos.tarifa() != null)                 this.tarifa = datos.tarifa();
        if (datos.recargoContraEntrega() != null)   this.recargoContraEntrega = datos.recargoContraEntrega();
        if (datos.logoUrl() != null)                this.logoUrl = datos.logoUrl();
        if (datos.servicioExpress() != null)        this.servicioExpress = datos.servicioExpress();
    }

    public void activar()    { this.activo = true; }
    public void desactivar() { this.activo = false; }

    // Calcula el costo total según la forma de pago
    public BigDecimal calcularCostoTotal(FormaPagoEnvio formaPagoEnvio) {
        if (formaPagoEnvio == FormaPagoEnvio.CONTRA_ENTREGA) {
            return this.tarifa.add(this.recargoContraEntrega);
        }
        return this.tarifa;
    }

    // Metodo que valida si el servicio está disponible para una forma de pago
    public void validarDisponibilidad(FormaPagoEnvio formaPagoEnvio) {
        if (this.servicioExpress && formaPagoEnvio == FormaPagoEnvio.CONTRA_ENTREGA) {
            throw new IllegalArgumentException(
                    "El servicio express no está disponible para pago contra entrega");
        }
    }
}