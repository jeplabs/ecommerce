# Propuesta de Ajuste Backend: Resolución Dinámica de Imágenes en Endpoint de Favoritos (`GET /api/favoritos`)

**Fecha:** 13 de Septiembre de 2026  
**Módulo:** Favoritos / Productos  
**Destinatarios:** Equipo de Desarrollo Backend (Spring Boot)

---

## 📌 Contexto y Diagnóstico

Actualmente, el frontend implementó una solución defensiva (*Client-Side Hydration*) en la vista de Favoritos (`FavoritesTab.tsx`) para mostrar las imágenes actualizadas en vivo consultando la memoria local de productos (`useProduct()`). 

Sin embargo, para garantizar la integridad de la arquitectura REST y contar con un **Single Source of Truth** en el servidor, se documenta este diagnóstico y propuesta de ajuste para ser implementado dinámicamente en el Backend.

---

## 🔍 Comportamiento Detectado

1. **Snapshot Estático de Imágenes:**
   - Cuando un producto se guarda en favoritos (`POST /api/favoritos/{productId}`), o al consultar la lista (`GET /api/favoritos`), la respuesta JSON devuelve el DTO `FavoriteProduct` con el campo `imagenUrl`.
   - Si al momento de marcar el producto como favorito este **no poseía imágenes** asociadas en la BD, la respuesta retorna `imagenUrl: null`.
   - Posteriormente, cuando un administrador sube o actualiza imágenes para dicho producto en el panel de administración, las llamadas futuras a `GET /api/favoritos` continúan retornando `imagenUrl: null` (o la URL estática congelada en el momento del guardado).

2. **Impacto en Clientes REST:**
   - Si un usuario consulta sus favoritos desde un dispositivo o sesión donde no se ha precargado el catálogo general en memoria, la API envía la referencia estática antigua, haciendo que se renderice el placeholder de imagen.

---

## 💡 Propuesta de Solución Técnica en Spring Boot

### 1. Entidad de Base de Datos (`Favorito.java` / Tabla `favoritos`)
- Garantizar que la tabla `favoritos` únicamente persista los identificadores de relación: `id`, `usuario_id`, `producto_id` y `created_at`.
- **No almacenar una columna fija `imagen_url` en la tabla `favoritos`.**

### 2. Mapeo Dinámico en la Capa de Servicios (`FavoritoService.java` / `FavoritoMapper.java`)
Al mapear la entidad `Favorito` a su DTO de respuesta `FavoriteProductDTO`:
- Consultar en tiempo real la colección de imágenes del producto (`producto.getImagenes()`).
- Seleccionar la imagen marcada como principal (`principal = true`), o en su defecto la primera disponible.

#### Ejemplo de Implementación Recomendada en Java:

```java
public FavoriteProductDTO toDTO(Favorito favorito) {
    Producto producto = favorito.getProducto();
    
    // Resolver la imagen principal dinámica del producto
    String imagenUrl = producto.getImagenes().stream()
            .filter(ImagenProducto::isPrincipal)
            .map(ImagenProducto::getUrl)
            .findFirst()
            .orElseGet(() -> producto.getImagenes().stream()
                    .map(ImagenProducto::getUrl)
                    .findFirst()
                    .orElse(null));

    return FavoriteProductDTO.builder()
            .productId(producto.getId())
            .slug(producto.getSlug())
            .nombre(producto.getNombre())
            .precioVenta(producto.getPrecioVenta())
            .moneda(producto.getMoneda())
            .imagenUrl(imagenUrl)
            .guardadoAt(favorito.getCreatedAt())
            .build();
}
```

---

## ✅ Beneficios de la Mejora

1. **Single Source of Truth:** Las actualizaciones de imágenes en el catálogo se reflejan instantáneamente en los favoritos de todos los usuarios sin necesidad de re-guardar la relación.
2. **Consistencia REST:** El contrato de API de favoritos se mantiene limpio y sincronizado con los endpoints del catálogo (`/api/productos`).
3. **Resiliencia Doble:** El frontend mantendrá su patrón de resiliencia como fallback, pero la API REST responderá siempre con los datos actualizados de forma primaria.

