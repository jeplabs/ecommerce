package com.jeplabs.ecommerce.domain.categoria;

import com.jeplabs.ecommerce.domain.producto.ProductoRepository;
import com.jeplabs.ecommerce.infra.exceptions.CategoriaEnUsoException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    public static final int MAX_PROFUNDIDAD = 5;

    private final CategoriaRepository repositorio;
    private final ProductoRepository productoRepositorio;

    // Listar devuelve solo las raíces porque el DTO construye el árbol recursivamente
    @Transactional(readOnly = true)
    public List<DatosRespuestaCategoria> listar() {
        return repositorio.findByParentIsNull()
                .stream()
                .map(DatosRespuestaCategoria::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public DatosRespuestaCategoria buscarPorId(Long id) {
        return new DatosRespuestaCategoria(buscarCategoria(id));
    }

    @Transactional(readOnly = true)
    public DatosRespuestaCategoria buscarPorSlug(String slug) {
        return new DatosRespuestaCategoria(
                repositorio.findBySlug(slug)
                        .orElseThrow(() -> new NoSuchElementException("Categoría no encontrada con slug: " + slug))
        );
    }

    // Crear valida que el slug sea válido y único, y que el padre exista y no exceda la profundidad máxima
    @Transactional
    public DatosRespuestaCategoria crear(DatosCrearCategoria datos) {
        String slug = validarSlugValido(datos.nombre());
        if (repositorio.existsBySlug(slug)) {
            throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
        }

        Categoria parent = null;
        if (datos.parentId() != null) {
            parent = buscarCategoriaPadre(datos.parentId());
            int profundidadPadre = calcularProfundidadDesdeRaiz(parent);
            if (profundidadPadre >= MAX_PROFUNDIDAD) {
                throw new IllegalArgumentException(
                        "No se pueden crear categorías con más de " + MAX_PROFUNDIDAD + " niveles de profundidad");
            }
        }

        Categoria categoria = new Categoria(datos, parent);
        repositorio.save(categoria);
        return new DatosRespuestaCategoria(categoria);
    }

    @Transactional
    public DatosRespuestaCategoria actualizar(Long id, DatosCrearCategoria datos) {
        Categoria categoria = buscarCategoria(id);

        String nuevoSlug = validarSlugValido(datos.nombre());
        if (!categoria.getSlug().equals(nuevoSlug) && repositorio.existsBySlug(nuevoSlug)) {
            throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
        }

        Categoria parent = null;
        if (datos.parentId() != null) {
            if (datos.parentId().equals(id)) {
                throw new IllegalArgumentException("Una categoría no puede ser su propio padre");
            }
            parent = buscarCategoriaPadre(datos.parentId());
            validarSinCicloJerarquico(id, parent);

            int profundidadPadre = calcularProfundidadDesdeRaiz(parent);
            int alturaSubarbol = calcularAlturaSubarbol(categoria, new HashSet<>());
            if (profundidadPadre + alturaSubarbol > MAX_PROFUNDIDAD) {
                throw new IllegalArgumentException(
                        "El movimiento supera la profundidad máxima permitida de " + MAX_PROFUNDIDAD + " niveles");
            }
        }

        categoria.actualizar(datos, parent);
        return new DatosRespuestaCategoria(categoria);
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = buscarCategoria(id);

        long subcategorias = repositorio.countByParentId(id);
        if (subcategorias > 0) {
            String detalle = subcategorias == 1
                    ? "1 subcategoría. Muévela o elimínala primero."
                    : subcategorias + " subcategorías. Muévelas o elimínalas primero.";
            throw new CategoriaEnUsoException(
                    "No se puede eliminar la categoría «" + categoria.getNombre() + "» porque contiene " + detalle,
                    CategoriaEnUsoException.CODIGO_CON_SUBCATEGORIAS
            );
        }

        long productos = productoRepositorio.contarPorCategoriaId(id);
        if (productos > 0) {
            String detalle = productos == 1
                    ? "1 producto asociado. Reasigna el producto antes de eliminar."
                    : productos + " productos asociados. Reasigna los productos antes de eliminar.";
            throw new CategoriaEnUsoException(
                    "No se puede eliminar la categoría «" + categoria.getNombre() + "» porque tiene " + detalle,
                    CategoriaEnUsoException.CODIGO_CON_PRODUCTOS
            );
        }

        repositorio.delete(categoria);
        repositorio.flush();
    }

    private Categoria buscarCategoria(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Categoría no encontrada con ID: " + id));
    }

    private Categoria buscarCategoriaPadre(Long parentId) {
        return repositorio.findById(parentId)
                .orElseThrow(() -> new IllegalArgumentException("Categoría padre no encontrada con ID: " + parentId));
    }

    private String validarSlugValido(String nombre) {
        String slug = Categoria.generarSlug(nombre);
        if (slug.isEmpty()) {
            throw new IllegalArgumentException("El nombre debe contener al menos un carácter alfanumérico");
        }
        return slug;
    }

    private void validarSinCicloJerarquico(Long categoriaId, Categoria nuevoPadre) {
        Set<Long> visitados = new HashSet<>();
        Categoria cursor = nuevoPadre;
        while (cursor != null) {
            if (categoriaId.equals(cursor.getId())) {
                throw new IllegalArgumentException(
                        "No se puede asignar una subcategoría descendiente o la misma categoría como padre");
            }
            if (cursor.getId() != null && !visitados.add(cursor.getId())) {
                throw new IllegalArgumentException("Jerarquía de categorías inválida: ciclo detectado");
            }
            cursor = cursor.getParent();
        }
    }

    private int calcularProfundidadDesdeRaiz(Categoria categoria) {
        int profundidad = 0;
        Set<Long> visitados = new HashSet<>();
        Categoria cursor = categoria;
        while (cursor != null) {
            if (cursor.getId() != null && !visitados.add(cursor.getId())) {
                throw new IllegalArgumentException("Jerarquía de categorías inválida: ciclo detectado");
            }
            profundidad++;
            cursor = cursor.getParent();
        }
        return profundidad;
    }

    private int calcularAlturaSubarbol(Categoria categoria, Set<Long> visitados) {
        if (categoria.getId() != null && !visitados.add(categoria.getId())) {
            throw new IllegalArgumentException("Jerarquía de categorías inválida: ciclo detectado");
        }
        List<Categoria> hijas = categoria.getSubcategorias();
        if (hijas == null || hijas.isEmpty()) {
            return 1;
        }
        int maxHija = 0;
        for (Categoria hija : hijas) {
            maxHija = Math.max(maxHija, calcularAlturaSubarbol(hija, visitados));
        }
        return 1 + maxHija;
    }
}
