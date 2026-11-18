# Guía para Frontend: Endpoints Admin de Productos

> **Objetivo:** Documentar los cambios implementados en la API de administración de productos para que el equipo de **Frontend** pueda consumirlos sin depender de endpoints públicos cuando un producto está `OCULTO` o `DESCONTINUADO`.

---

## 1. Búsqueda por Nombre o SKU en `GET /api/productos/admin`

### Endpoint
`GET /api/productos/admin` *(Requiere rol `ADMIN`)*

### Parámetros de consulta
- `nombre` *(opcional, `string`)*: Filtra por coincidencia parcial (case-insensitive) tanto en el **nombre** del producto como en su **SKU**.
  - Si se envía vacío o solo con espacios (`?nombre=` o `?nombre=%20%20`), el backend lo normaliza a `null` y devuelve el listado sin filtro de texto.
- `categoriaId` *(opcional, `number`)*
- `estado` *(opcional, `DISPONIBLE | SIN_STOCK | OCULTO | DESCONTINUADO`)*
- `page`, `size`, `sort` *(paginación estándar de Spring Data; por defecto `size=10, sort=nombre`)*

### Ejemplo
```http
GET /api/productos/admin?nombre=SKU-LAP&page=0&size=10
Authorization: Bearer <access_token>
```

---

## 2. Contrato Completo en `DatosRespuestaProductoAdmin`

Tanto `GET /api/productos/admin` como `GET /api/productos/admin/{id}` (y las respuestas de `PATCH /api/productos/{id}/precio` y `PATCH /api/productos/{id}/estado`) ahora devuelven los campos completos necesarios para el formulario de edición, **sin importar si el producto está `OCULTO` o `DESCONTINUADO`**:

```json
{
  "id": 1,
  "sku": "SKU-LAP-001",
  "nombre": "Laptop Pro 16",
  "slug": "laptop-pro-16",
  "descripcion": "Laptop de alto rendimiento",
  "specs": {
    "ram": "32GB",
    "cpu": "M3"
  },
  "stock": 5,
  "estado": "OCULTO",
  "precioVenta": 1500.00,
  "precioCosto": 1000.00,
  "margenPorcentaje": 33.33,
  "moneda": "GTQ",
  "imagenes": [
    {
      "id": 10,
      "url": "https://cdn.example.com/laptop.jpg",
      "principal": true
    }
  ],
  "categorias": [
    {
      "id": 2,
      "nombre": "Laptops",
      "slug": "laptops",
      "parentId": null,
      "subcategorias": []
    }
  ],
  "createdAt": "2026-11-18T09:50:00",
  "updatedAt": "2026-11-18T09:50:00"
}
```

### Recomendación de uso en Frontend
- Para abrir el formulario de edición de un producto en el panel admin, consumir exclusivamente **`GET /api/productos/admin/{id}`** en lugar de `GET /api/productos/{id}`.
- El endpoint público `GET /api/productos/{id}` continúa rechazando productos en estado `OCULTO` o `DESCONTINUADO`.

---

## 3. Consulta Dedicada de Imágenes en Admin

### Endpoint
`GET /api/productos/admin/{id}/imagenes` *(Requiere rol `ADMIN`)*

### Respuesta (`200 OK`)
Devuelve la lista de imágenes del producto (ordenada con `principal: true` primero), sin importar si el producto se encuentra `OCULTO` o `DESCONTINUADO`:

```json
[
  {
    "id": 10,
    "url": "https://cdn.example.com/laptop.jpg",
    "principal": true
  }
]
```

### Errores posibles
- `401 Unauthorized`: Token ausente, inválido o expirado.
- `403 Forbidden`: El usuario autenticado no tiene rol `ADMIN`.
- `404 Not Found`: No existe un producto con el `id` indicado.

> **Nota:** El endpoint público `GET /api/productos/{id}/imagenes` mantiene su restricción original y solo responde para productos visibles al cliente (`DISPONIBLE` y `SIN_STOCK`).
