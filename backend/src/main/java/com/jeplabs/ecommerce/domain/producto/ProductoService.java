package com.jeplabs.ecommerce.domain.producto;

import com.jeplabs.ecommerce.domain.categoria.Categoria;
import com.jeplabs.ecommerce.domain.categoria.CategoriaRepository;
import com.jeplabs.ecommerce.domain.categoria.DatosRespuestaCategoria;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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

    // Validación para el endpoint público, lista solo productos que estén activos
    public DatosRespuestaProducto buscarPorId(Long id) {
        return new DatosRespuestaProducto(buscarProductoActivo(id));
    }

    // Validación para el endpoint público, lista producto con sku si producto esta activo
    public DatosRespuestaProducto buscarPorSku(String sku) {
        Producto producto = productoRepositorio.findBySku(sku)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con SKU: " + sku));
        if (!producto.getEstado().esVisibleParaCliente()) {
            throw new IllegalArgumentException("Producto no encontrado con SKU: " + sku);
        }
        return new DatosRespuestaProducto(producto);
    }

    // Validación para el endpoint público, lista producto con slug si producto esta activo
    public DatosRespuestaProducto buscarPorSlug(String slug) {
        Producto producto = productoRepositorio.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con slug: " + slug));
        if (!producto.getEstado().esVisibleParaCliente()) {
            throw new IllegalArgumentException("Producto no encontrado con slug: " + slug);
        }
        return new DatosRespuestaProducto(producto);
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

    // Cambiar el estado de un producto
    @Transactional
    public DatosRespuestaProductoAdmin cambiarEstado(Long id, DatosActualizarEstado datos) {
        Producto producto = buscarProducto(id);
        producto.cambiarEstado(datos.estado());
        return new DatosRespuestaProductoAdmin(producto);
    }

    // Borrado lógico, es decir DESCONTINUADO
    @Transactional
    public void descontinuar(Long id) {
        Producto producto = buscarProducto(id);
        producto.descontinuar();
    }

    // Para endpoints públicos - solo productos por estado DISPONIBLE y SIN_STOCK
    private Producto buscarProductoActivo(Long id) {
        Producto producto = buscarProducto(id);
        if (!producto.getEstado().esVisibleParaCliente()) {
            throw new IllegalArgumentException("Producto no encontrado con ID: " + id);
        }
        return producto;
    }

    // Para admin - devuelve cualquier producto activo o no
    private Producto buscarProducto(Long id) {
        return productoRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + id));
    }

    // Admin - listar categorías
    private List<Categoria> obtenerCategorias(List<Long> ids) {
        List<Categoria> categorias = categoriaRepositorio.findAllById(ids);
        if (categorias.size() != ids.size()) {
            throw new IllegalArgumentException("Una o más categorías no existen");
        }
        return categorias;
    }

    // Listar todas las imágenes de un producto
    public List<DatosRespuestaImagen> listarImagenes(Long productoId) {
        buscarProductoActivo(productoId); // verifica que el producto exista y este activo
        return imagenRepositorio.findByProductoIdOrderByPrincipalDesc(productoId)
                .stream()
                .map(DatosRespuestaImagen::new)
                .toList();
    }

    // Agregar imágenes a un producto existente
    @Transactional
    public List<DatosRespuestaImagen> agregarImagenes(Long productoId, DatosAgregarImagenes datos) {
        Producto producto = buscarProducto(productoId);

        boolean tienePrincipal = !imagenRepositorio.findByProductoIdOrderByPrincipalDesc(productoId).isEmpty();

        List<ProductoImagen> nuevas = new ArrayList<>();
        for (int i = 0; i < datos.imagenesUrl().size(); i++) {
            // Si el producto no tenía imágenes, la primera nueva será la principal
            boolean esPrincipal = !tienePrincipal && i == 0;
            nuevas.add(new ProductoImagen(producto, datos.imagenesUrl().get(i), esPrincipal));
        }

        imagenRepositorio.saveAll(nuevas);
        return nuevas.stream().map(DatosRespuestaImagen::new).toList();
    }

    // Cambiar imagen principal
    @Transactional
    public DatosRespuestaImagen cambiarImagenPrincipal(Long productoId, Long imagenId) {
        buscarProducto(productoId);

        ProductoImagen imagen = imagenRepositorio.findByIdAndProductoId(imagenId, productoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Imagen no encontrada con ID: " + imagenId + " para el producto: " + productoId));

        // Quitar principal de todas y asignarla a la seleccionada
        imagenRepositorio.resetearPrincipal(productoId);
        imagen.marcarComoPrincipal();

        return new DatosRespuestaImagen(imagen);
    }

    // Eliminar imagen
    @Transactional
    public void eliminarImagen(Long productoId, Long imagenId) {
        buscarProducto(productoId);

        ProductoImagen imagen = imagenRepositorio.findByIdAndProductoId(imagenId, productoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Imagen no encontrada con ID: " + imagenId + " para el producto: " + productoId));

        if (imagen.isPrincipal()) {
            throw new IllegalArgumentException(
                    "No puedes eliminar la imagen principal, primero asigna otra como principal");
        }

        imagenRepositorio.delete(imagen);
    }

    // Listar categorías de un producto
    public List<DatosRespuestaCategoria> listarCategorias(Long productoId) {
        Producto producto = buscarProductoActivo(productoId);
        return producto.getCategorias()
                .stream()
                .map(DatosRespuestaCategoria::new)
                .toList();
    }

    // Agregar categorías a un producto existente
    @Transactional
    public DatosRespuestaProducto agregarCategorias(Long productoId, DatosActualizarCategorias datos) {
        Producto producto = buscarProducto(productoId);

        List<Categoria> nuevasCategorias = obtenerCategorias(datos.categoriaIds());

        // Agrega solo las que no tiene ya asignadas
        nuevasCategorias.stream()
                .filter(c -> !producto.getCategorias().contains(c))
                .forEach(producto.getCategorias()::add);

        return new DatosRespuestaProducto(producto);
    }

    // Quitar categorías de un producto
    @Transactional
    public DatosRespuestaProducto quitarCategorias(Long productoId, DatosActualizarCategorias datos) {
        Producto producto = buscarProducto(productoId);

        List<Categoria> categoriasAQuitar = obtenerCategorias(datos.categoriaIds());

        // Verifica que no quede sin ninguna categoría
        long categoriasRestantes = producto.getCategorias().stream()
                .filter(c -> !categoriasAQuitar.contains(c))
                .count();

        if (categoriasRestantes == 0) {
            throw new IllegalArgumentException(
                    "El producto debe pertenecer al menos a una categoría");
        }

        producto.getCategorias().removeAll(categoriasAQuitar);
        return new DatosRespuestaProducto(producto);
    }

    // Reemplazar todas las categorías de un producto
    @Transactional
    public DatosRespuestaProducto reemplazarCategorias(Long productoId, DatosActualizarCategorias datos) {
        Producto producto = buscarProducto(productoId);

        List<Categoria> nuevasCategorias = obtenerCategorias(datos.categoriaIds());
        producto.getCategorias().clear();
        producto.getCategorias().addAll(nuevasCategorias);

        return new DatosRespuestaProducto(producto);
    }
}