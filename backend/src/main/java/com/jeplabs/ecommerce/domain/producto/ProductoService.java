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

    // Listado público avanzado con facetas (Enfoque híbrido H2-Compatible)
    public DatosRespuestaCatalogoPage listarFacetado(
            String nombre,
            Long categoriaId,
            Double precioMin,
            Double precioMax,
            org.springframework.util.MultiValueMap<String, String> params,
            Pageable pageable) {

        // 1. Base filtrada desde BD
        List<Producto> productosBase = productoRepositorio.buscarActivosSinPaginacion(nombre, categoriaId);

        // 2. Filtros dinámicos en memoria (precio y specs)
        List<Producto> filtrados = new ArrayList<>();
        for (Producto p : productosBase) {
            boolean matches = true;

            if (precioMin != null || precioMax != null) {
                double precioActual = p.getPrecios().stream()
                        .filter(pr -> pr.getFechaFin() == null)
                        .mapToDouble(pr -> pr.getPrecioVenta().doubleValue())
                        .findFirst().orElse(0.0);
                if (precioMin != null && precioActual < precioMin) matches = false;
                if (precioMax != null && precioActual > precioMax) matches = false;
            }

            if (matches && params != null) {
                for (java.util.Map.Entry<String, java.util.List<String>> entry : params.entrySet()) {
                    String key = entry.getKey();
                    if (isReservedParam(key)) continue;

                    java.util.List<String> validValues = entry.getValue();
                    if (validValues == null || validValues.isEmpty()) continue;

                    String prodValue = null;
                    if (p.getSpecs() != null && p.getSpecs().containsKey(key)) {
                        prodValue = String.valueOf(p.getSpecs().get(key));
                    }
                    if (prodValue == null) {
                        matches = false;
                        break;
                    }

                    String matchVal = normalizeSpecMatch(prodValue);
                    boolean specMatched = false;
                    for (String val : validValues) {
                        if (normalizeSpecMatch(val).equals(matchVal)) {
                            specMatched = true;
                            break;
                        }
                    }
                    if (!specMatched) {
                        matches = false;
                        break;
                    }
                }
            }

            if (matches) filtrados.add(p);
        }

        // 3. Cálculo de Facetas sobre los resultados
        java.util.Map<String, java.util.Map<String, DatosRespuestaFaceta>> tempFacets = new java.util.HashMap<>();
        for (Producto p : filtrados) {
            if (p.getSpecs() != null) {
                p.getSpecs().forEach((key, rawValue) -> {
                    String displayLabel = normalizeSpecDisplay(rawValue);
                    String matchValue = normalizeSpecMatch(rawValue);
                    if (!matchValue.isEmpty()) {
                        tempFacets.computeIfAbsent(key, k -> new java.util.HashMap<>())
                                .compute(matchValue, (mVal, faceta) -> {
                                    if (faceta == null) {
                                        return new DatosRespuestaFaceta(matchValue, displayLabel, 1);
                                    } else {
                                        return new DatosRespuestaFaceta(matchValue, displayLabel, faceta.count() + 1);
                                    }
                                });
                    }
                });
            }
        }

        java.util.Map<String, List<DatosRespuestaFaceta>> finalFacets = new java.util.HashMap<>();
        tempFacets.forEach((key, map) -> {
            List<DatosRespuestaFaceta> list = new ArrayList<>(map.values());
            list.sort(java.util.Comparator.comparing(DatosRespuestaFaceta::displayLabel));
            finalFacets.put(key, list);
        });

        // 4. Paginación Manual
        int totalElements = filtrados.size();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), totalElements);
        List<Producto> paginatedList = start <= end ? filtrados.subList(start, end) : new ArrayList<>();
        
        int totalPages = pageable.getPageSize() == 0 ? 1 : (int) Math.ceil((double) totalElements / pageable.getPageSize());
        boolean isFirst = start == 0;
        boolean isLast = end >= totalElements;

        List<DatosRespuestaProducto> content = paginatedList.stream().map(DatosRespuestaProducto::new).toList();

        return new DatosRespuestaCatalogoPage(
                content,
                pageable.getPageNumber(),
                pageable.getPageSize(),
                totalElements,
                totalPages,
                isFirst,
                isLast,
                finalFacets
        );
    }

    private boolean isReservedParam(String key) {
        return java.util.Set.of("search", "nombre", "categoriaId", "precioMin", "precioMax", "page", "size", "sort").contains(key);
    }

    private String normalizeSpecDisplay(Object raw) {
        if (raw == null) return "";
        return String.valueOf(raw).trim().replaceAll("\\s+", " ");
    }

    private String normalizeSpecMatch(Object raw) {
        return normalizeSpecDisplay(raw).replaceAll("\\s", "");
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

    //Para admin - devuelve lista de todos los productos con sus estados
    public Page<DatosRespuestaProductoAdmin> listarAdmin(
            String nombre, Long categoriaId, EstadoProducto estado, Pageable pageable) {
        String estadoStr = estado != null ? estado.name() : null;
        return productoRepositorio.buscarTodosAdmin(nombre, categoriaId, estadoStr, pageable)
                .map(DatosRespuestaProductoAdmin::new);
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