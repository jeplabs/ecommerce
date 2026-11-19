# Guía de Integración Frontend — Ordenamiento Global de Productos y Paginación de Favoritos

Esta guía documenta los cambios realizados en el backend para resolver:
1. **Ordenamiento global multi-página** en el catálogo público (incluyendo categorías padre y subcategorías) y en el panel de administración de productos.
2. **Paginación server-side de favoritos** junto con un endpoint ligero de IDs para los íconos de corazón en el catálogo.

---

## 1. Catálogo Público (`GET /api/productos`)

### 1.1. Qué cambió en el backend
- `ProductoService.listarFacetado` ahora aplica `pageable.getSort()` **sobre el universo completo de productos filtrados antes de paginar** (con desempate determinista por `id`), en lugar de ignorar `sort` o depender del orden fijo `ORDER BY p.nombre`.
- Al filtrar por `categoriaId` correspondiente a una **categoría padre**, el backend incluye automáticamente los productos de esa categoría **y de todas sus subcategorías hijas/descendientes**.

### 1.2. Parámetros soportados
| Parámetro | Tipo | Default | Descripción |
| :--- | :--- | :--- | :--- |
| `search` (o `nombre`) | `String` | `null` | Búsqueda por nombre |
| `categoriaId` | `Long` | `null` | ID de categoría padre o subcategoría |
| `precioMin` / `precioMax` | `Double` | `null` | Rango de precio |
| `page` | `int` | `0` | Número de página (base 0) |
| `size` | `int` | `12` | Cantidad de productos por página |
| `sort` | `String` | `nombre,asc` | Criterio de ordenamiento global (`campo,asc` o `campo,desc`) |

### 1.3. Valores válidos para `sort` en Catálogo Público
- `precioVenta,asc` — Precio: menor a mayor (alias aceptados: `precio`, `price`)
- `precioVenta,desc` — Precio: mayor a menor
- `nombre,asc` — Nombre: A - Z (alias aceptado: `name`)
- `nombre,desc` — Nombre: Z - A
- `createdAt,desc` — Más recientes primero (alias aceptados: `fecha`, `masRecientes`, `recientes`)
- `stock,desc` / `stock,asc` — Disponibilidad de stock
- `id,asc` / `id,desc` — Por ID

### 1.4. Buenas prácticas requeridas en Frontend
1. **No ordenar localmente en memoria** el arreglo `response.content`: elimina cualquier `.sort(...)` en el cliente sobre los resultados paginados y envía el parámetro `sort` al backend.
2. **Reiniciar `page` a `0`** cada vez que cambie el selector de ordenamiento (`sort`), el filtro de categoría/subcategoría o cualquier faceta/precio.
3. **Ejemplo de petición**:
   ```http
   GET /api/productos?categoriaId=2&page=0&size=12&sort=precioVenta,asc
   ```

---

## 2. Panel de Administración de Productos (`GET /api/productos/admin`)

### 2.1. Qué cambió en el backend
- `GET /api/productos/admin` ya no tiene `ORDER BY p.nombre` fijo en SQL.
- Ahora ordena globalmente a través de todas las páginas antes de cortar la página solicitada e incluye también productos de subcategorías cuando se filtra por `categoriaId` de una categoría padre.

### 2.2. Parámetros y criterios de `sort` en Admin
- **Filtros**: `nombre` (busca por nombre o SKU), `categoriaId`, `estado` (`DISPONIBLE`, `SIN_STOCK`, `OCULTO`, `DESCONTINUADO`), `page` (default `0`), `size` (default `10`), `sort` (default `nombre,asc`).
- **Valores válidos para `sort`**:
  - `nombre,asc` / `nombre,desc`
  - `sku,asc` / `sku,desc`
  - `precioVenta,asc` / `precioVenta,desc`
  - `precioCosto,asc` / `precioCosto,desc`
  - `margenPorcentaje,asc` / `margenPorcentaje,desc` (alias: `margen`)
  - `stock,asc` / `stock,desc`
  - `estado,asc` / `estado,desc`
  - `createdAt,desc` / `createdAt,asc`
  - `updatedAt,desc` / `updatedAt,asc`

- **Ejemplo de petición**:
  ```http
  GET /api/productos/admin?estado=DISPONIBLE&page=0&size=10&sort=precioVenta,desc
  ```

---

## 3. Favoritos Paginados y Endpoint Ligero de IDs

Para escalar cuando un usuario guarda decenas o cientos de productos sin penalizar el rendimiento ni el marcado de corazones en el catálogo, se separaron dos responsabilidades:

### 3.1. Vista "Mis Favoritos" — `GET /api/favoritos` (Paginado)

> [!IMPORTANT]
> **Cambio de contrato**: `GET /api/favoritos` ahora devuelve un objeto `Page<DatosRespuestaFavorito>` estándar de Spring Data en lugar de un arreglo plano `List<DatosRespuestaFavorito>`.

- **Parámetros**:
  - `page` (default `0`)
  - `size` (default `12`)
  - `sort` (default `creadoAt,desc`; también soporta `creadoAt,asc`)
- **Ejemplo de petición**:
  ```http
  GET /api/favoritos?page=0&size=12&sort=creadoAt,desc
  Authorization: Bearer <access_token>
  ```
- **Estructura de respuesta** (serialización `Page` de Spring Boot 4):
  ```json
  {
    "content": [
      {
        "productId": 100,
        "slug": "mouse-gamer",
        "nombre": "Mouse Gamer",
        "precioVenta": 350.00,
        "moneda": "GTQ",
        "imagenUrl": "https://cdn.example.com/mouse.jpg",
        "guardadoAt": "2026-11-18T12:00:00"
      }
    ],
    "page": {
      "size": 12,
      "number": 0,
      "totalElements": 25,
      "totalPages": 3
    }
  }
  ```

### 3.2. Corazones en Tarjetas del Catálogo — `GET /api/favoritos/ids`

Para saber qué tarjetas del catálogo mostrar con el ícono de favorito activo sin descargar todas las páginas de `GET /api/favoritos`:

- **Endpoint**: `GET /api/favoritos/ids` (requiere `Authorization: Bearer <access_token>`).
- **Respuesta**: Arreglo ligero con los IDs de productos favoritos ordenados del más reciente al más antiguo:
  ```json
  [100, 105, 110]
  ```
- **Flujo recomendado en Frontend**:
  1. Al iniciar sesión (o montar el contexto global de favoritos), consultar `GET /api/favoritos/ids` y guardar un `Set<number>` en memoria para pintar los corazones en catálogo/detalle.
  2. Al hacer `POST /api/favoritos/{productoId}` o `DELETE /api/favoritos/{productoId}`, actualizar optimistamente el `Set<number>` de IDs (y refrescar la página actual de `GET /api/favoritos` si el usuario está en la vista de Favoritos).
  3. En la página `/favoritos`, consumir `GET /api/favoritos?page={page}&size=12` y renderizar controles de paginación usando `page.totalPages`, `page.totalElements`, `page.number` y `page.size`.
