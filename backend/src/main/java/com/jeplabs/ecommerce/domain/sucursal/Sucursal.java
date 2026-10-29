package com.jeplabs.ecommerce.domain.sucursal;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sucursales")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Sucursal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String direccion;
    private String ciudad;
    private String estado;

    @Column(name = "codigo_postal")
    private String codigoPostal;

    private String pais;
    private String telefono;
    private String horario;
    private String referencias;

    @Column(name = "mapa_url")
    private String mapaUrl;

    private boolean activo;

    @Column(name = "orden_visualizacion")
    private Integer ordenVisualizacion;

    @Column(name = "creado_at")
    private LocalDateTime creadoAt;

    @Column(name = "actualizado_at")
    private LocalDateTime actualizadoAt;

    public Sucursal(DatosCrearSucursal datos) {
        this.nombre = datos.nombre();
        this.direccion = datos.direccion();
        this.ciudad = datos.ciudad();
        this.estado = datos.estado();
        this.codigoPostal = datos.codigoPostal();
        this.pais = datos.pais() != null && !datos.pais().isBlank() ? datos.pais() : "GT";
        this.telefono = datos.telefono();
        this.horario = datos.horario();
        this.referencias = datos.referencias();
        this.mapaUrl = datos.mapaUrl();
        this.activo = true;
        this.ordenVisualizacion = datos.ordenVisualizacion() != null ? datos.ordenVisualizacion() : 1;
        this.creadoAt = LocalDateTime.now();
        this.actualizadoAt = LocalDateTime.now();
    }

    public void actualizar(DatosActualizarSucursal datos) {
        if (datos.nombre() != null)             this.nombre = datos.nombre();
        if (datos.direccion() != null)          this.direccion = datos.direccion();
        if (datos.ciudad() != null)             this.ciudad = datos.ciudad();
        if (datos.estado() != null)             this.estado = datos.estado().isBlank() ? null : datos.estado();
        if (datos.codigoPostal() != null)       this.codigoPostal = datos.codigoPostal().isBlank() ? null : datos.codigoPostal();
        if (datos.pais() != null)               this.pais = datos.pais();
        if (datos.telefono() != null)           this.telefono = datos.telefono();
        if (datos.horario() != null)            this.horario = datos.horario();
        if (datos.referencias() != null)        this.referencias = datos.referencias().isBlank() ? null : datos.referencias();
        if (datos.mapaUrl() != null)            this.mapaUrl = datos.mapaUrl().isBlank() ? null : datos.mapaUrl();
        if (datos.ordenVisualizacion() != null) this.ordenVisualizacion = datos.ordenVisualizacion();
        this.actualizadoAt = LocalDateTime.now();
    }

    public void activar() {
        this.activo = true;
        this.actualizadoAt = LocalDateTime.now();
    }

    public void desactivar() {
        this.activo = false;
        this.actualizadoAt = LocalDateTime.now();
    }
}
