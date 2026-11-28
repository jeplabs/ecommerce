package com.jeplabs.ecommerce.domain.producto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "busqueda_sinonimos")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class BusquedaSinonimo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_grupo", nullable = false, unique = true, length = 100)
    private String nombreGrupo;

    @Column(nullable = false, length = 500)
    private String terminos;

    @Column(nullable = false)
    private boolean activo = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public BusquedaSinonimo(String nombreGrupo, String terminosNormalizados, boolean activo) {
        this.nombreGrupo = nombreGrupo;
        this.terminos = terminosNormalizados;
        this.activo = activo;
    }

    public void actualizar(String nombreGrupo, String terminosNormalizados, boolean activo) {
        this.nombreGrupo = nombreGrupo;
        this.terminos = terminosNormalizados;
        this.activo = activo;
    }

    public void toggleActivo() {
        this.activo = !this.activo;
    }

    public List<String> obtenerListaTerminos() {
        if (this.terminos == null || this.terminos.isBlank()) {
            return List.of();
        }
        return Arrays.stream(this.terminos.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
