package com.jeplabs.ecommerce.domain.categoria;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository repositorio;

    // Listar devuelve solo las raíces porque el DTO construye el árbol recursivamente
    public List<DatosRespuestaCategoria> listar() {
        return repositorio.findByParentIsNull()
                .stream()
                .map(DatosRespuestaCategoria::new)
                .toList();
    }

    public DatosRespuestaCategoria buscarPorId(Long id) {
        return new DatosRespuestaCategoria(buscarCategoria(id));
    }

    public DatosRespuestaCategoria buscarPorSlug(String slug) {
        return new DatosRespuestaCategoria(
                repositorio.findBySlug(slug)
                        .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada con slug: " + slug))
        );
    }

    //  Crear valida que el slug no esté duplicado y que el padre exista si se proporciona
    @Transactional
    public DatosRespuestaCategoria crear(DatosCrearCategoria datos) {
        if (repositorio.existsBySlug(Categoria.generarSlug(datos.nombre()))) {
            throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
        }

        Categoria parent = null;
        if (datos.parentId() != null) {
            parent = buscarCategoria(datos.parentId());
        }

        Categoria categoria = new Categoria(datos, parent);
        repositorio.save(categoria);
        return new DatosRespuestaCategoria(categoria);
    }

    @Transactional
    public DatosRespuestaCategoria actualizar(Long id, DatosCrearCategoria datos) {
        Categoria categoria = buscarCategoria(id);

        String nuevoSlug = Categoria.generarSlug(datos.nombre());
        if (!categoria.getSlug().equals(nuevoSlug) && repositorio.existsBySlug(nuevoSlug)) {
            throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
        }

        Categoria parent = null;
        if (datos.parentId() != null) {
            if (datos.parentId().equals(id)) {
                throw new IllegalArgumentException("Una categoría no puede ser su propio padre");
            }
            parent = buscarCategoria(datos.parentId());
        }

        categoria.actualizar(datos, parent);
        return new DatosRespuestaCategoria(categoria);
    }

    // Método privado reutilizable para buscar o lanzar excepción
    private Categoria buscarCategoria(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada con ID: " + id));
    }
}
