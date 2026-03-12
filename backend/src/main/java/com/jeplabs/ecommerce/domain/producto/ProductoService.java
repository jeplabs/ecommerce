package com.jeplabs.ecommerce.domain.producto;

import com.jeplabs.ecommerce.domain.categoria.Categoria;
import com.jeplabs.ecommerce.domain.categoria.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Contiene toda la lógica de negocio
@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepositorio;
    private final PrecioHistorialRepository precioRepositorio;
    private final ProductoImagenRepository imagenRepositorio;
    private final CategoriaRepository categoriaRepositorio;

    // Listado público con paginación con Pageable y filtros
    public Page<DatosRespuestaProducto> listar(String nombre, Long categoriaId, Pageable pageable) {
        return productoRepositorio.buscarActivos(nombre, categoriaId, pageable)
                .map(DatosRespuestaProducto::new);
    }

    public DatosRespuestaProducto buscarPorId(Long id) {
        return new DatosRespuestaProducto(buscarProducto(id));
    }

    public DatosRespuestaProducto buscarPorSku(String sku) {
        return new DatosRespuestaProducto(
                productoRepositorio.findBySku(sku)
                        .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con SKU: " + sku))
        );
    }

    public DatosRespuestaProducto buscarPorSlug(String slug) {
        return new DatosRespuestaProducto(
                productoRepositorio.findBySlug(slug)
                        .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con slug: " + slug))
        );
    }

    // Vista admin con precio de costo y margen
    public DatosRespuestaProductoAdmin buscarAdminPorId(Long id) {
        return new DatosRespuestaProductoAdmin(buscarProducto(id));
    }

    // Al crear un producto, registra el precio inicial en el historial.
    @Transactional
    public DatosRespuestaProducto crear(DatosCrearProducto datos) {
        if (productoRepositorio.existsBySku(datos.sku())) {
            throw new IllegalArgumentException("Ya existe un producto con ese SKU");
        }

        List<Categoria> categorias = obtenerCategorias(datos.categoriaIds());
        Producto producto = new Producto(datos, categorias);
        productoRepositorio.save(producto);

        // Registrar precio inicial en el historial
        PrecioHistorial precio = new PrecioHistorial(producto, datos.precio());
        precioRepositorio.save(precio);

        // Registrar imágenes si las hay
        if (datos.imagenesUrl() != null && !datos.imagenesUrl().isEmpty()) {
            for (int i = 0; i < datos.imagenesUrl().size(); i++) {
                boolean esPrincipal = i == 0; // primera imagen es la principal
                imagenRepositorio.save(new ProductoImagen(producto, datos.imagenesUrl().get(i), esPrincipal));
            }
        }

        return new DatosRespuestaProducto(productoRepositorio.findById(producto.getId()).orElseThrow());
    }

    // Al actualizar el precio cierra el precio anterior y abre uno nuevo.
    @Transactional
    public DatosRespuestaProducto actualizar(Long id, DatosActualizarProducto datos) {
        Producto producto = buscarProducto(id);
        producto.actualizar(datos);

        if (datos.categoriaIds() != null && !datos.categoriaIds().isEmpty()) {
            List<Categoria> categorias = obtenerCategorias(datos.categoriaIds());
            producto.getCategorias().clear();
            producto.getCategorias().addAll(categorias);
        }

        return new DatosRespuestaProducto(producto);
    }

    // Actualizar precio: cierra el actual y abre uno nuevo
    @Transactional
    public DatosRespuestaProductoAdmin actualizarPrecio(Long id, DatosPrecio datos) {
        Producto producto = buscarProducto(id);

        // Cerrar precio actual
        precioRepositorio.findByProductoIdAndFechaFinIsNull(id)
                .ifPresent(precio -> {
                    precio.cerrar();
                    precioRepositorio.save(precio);
                });

        // Abrir nuevo precio
        PrecioHistorial nuevoPrecio = new PrecioHistorial(producto, datos);
        precioRepositorio.save(nuevoPrecio);

        return new DatosRespuestaProductoAdmin(productoRepositorio.findById(id).orElseThrow());
    }

    // Borrado lógico
    @Transactional
    public void desactivar(Long id) {
        Producto producto = buscarProducto(id);
        producto.desactivar();
    }

    private Producto buscarProducto(Long id) {
        return productoRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + id));
    }

    private List<Categoria> obtenerCategorias(List<Long> ids) {
        List<Categoria> categorias = categoriaRepositorio.findAllById(ids);
        if (categorias.size() != ids.size()) {
            throw new IllegalArgumentException("Una o más categorías no existen");
        }
        return categorias;
    }
}