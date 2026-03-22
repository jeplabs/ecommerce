package com.jeplabs.ecommerce.domain.categoria;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

// La relación con parent es recursiva, una categoría puede tener una categoría padre del mismo tipo.
// Las subcategorias es la lista de hijos.
@Entity
@Table(name = "categorias")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String slug;

    // FetchType.LAZY para no cargar toda la jerarquía innecesariament
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Categoria parent;

    // lo mismo que arriba
    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    private List<Categoria> subcategorias = new ArrayList<>();

    public Categoria(DatosCrearCategoria datos, Categoria parent) {
        this.nombre = datos.nombre();
        this.slug = generarSlug(datos.nombre());
        this.parent = parent;
    }

    public void actualizar(DatosCrearCategoria datos, Categoria parent) {
        this.nombre = datos.nombre();
        this.slug = generarSlug(datos.nombre());
        this.parent = parent;
    }

    // Genera slug a partir del nombre: "Cámaras Mirrorless" → "camaras-mirrorless"
    public static String generarSlug(String nombre) {
        return nombre.toLowerCase()
                .replaceAll("[áàäâ]", "a")
                .replaceAll("[éèëê]", "e")
                .replaceAll("[íìïî]", "i")
                .replaceAll("[óòöô]", "o")
                .replaceAll("[úùüû]", "u")
                .replaceAll("[ñ]", "n")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s]+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}