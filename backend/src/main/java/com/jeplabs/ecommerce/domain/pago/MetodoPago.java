package com.jeplabs.ecommerce.domain.pago;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "metodos_pago")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class MetodoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;
    private String nombre;
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private TipoMetodoPago tipo;

    private boolean activo;
    private Integer ordenVisualizacion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> configuracion;

    public void actualizar(DatosActualizarMetodoPago datos) {
        if (datos.nombre() != null)              this.nombre = datos.nombre();
        if (datos.descripcion() != null)         this.descripcion = datos.descripcion();
        if (datos.ordenVisualizacion() != null)  this.ordenVisualizacion = datos.ordenVisualizacion();
        if (datos.configuracion() != null)       this.configuracion = datos.configuracion();
    }

    public void activar()    { this.activo = true; }
    public void desactivar() { this.activo = false; }
}