# Guía de Integración: API de Catálogo con Facetas

El backend ha sido actualizado para calcular las facetas y filtrar productos dinámicamente. El frontend **ya no necesita (ni debe) procesar las especificaciones en memoria ni iterar todos los productos**.

## 1. El Nuevo Contrato HTTP (`GET /api/productos`)

### Parámetros Aceptados por URL (Query Params)
El endpoint acepta los siguientes parámetros fijos:
- `search` o `nombre`: Término de búsqueda de texto.
- `categoriaId`: ID de la categoría seleccionada.
- `precioMin` y `precioMax`: Filtros de rango de precio numéricos.
- `page` (0-indexed) y `size` (por defecto 12).

**¡Filtros Dinámicos (Facetas)!**
Adicional a los parámetros fijos, el endpoint ahora acepta **CUALQUIER** especificación dinámica que corresponda al JSON `specs` de la base de datos.
Ejemplo: `GET /api/productos?Marca=Apple&RAM=16gb&RAM=32gb&page=0`

### 2. Estructura de Respuesta JSON (`DatosRespuestaCatalogoPage`)

La respuesta mantiene la compatibilidad con el esquema de paginación de Spring, pero inyecta el nuevo objeto `facets` en la raíz de la respuesta:

```json
{
  "content": [
    { "id": 1, "nombre": "MacBook Pro", "precioVenta": 2000.00, "specs": {"Marca": "Apple", "RAM": "16GB"} },
    { "id": 2, "nombre": "MacBook Air", "precioVenta": 1200.00, "specs": {"Marca": "Apple", "RAM": "16GB"} }
  ],
  "number": 0,
  "size": 12,
  "totalElements": 2,
  "totalPages": 1,
  "first": true,
  "last": true,
  "facets": {
    "Marca": [
      { "matchValue": "apple", "displayLabel": "Apple", "count": 2 }
    ],
    "RAM": [
      { "matchValue": "16gb", "displayLabel": "16GB", "count": 2 }
    ]
  }
}
```

## 3. Cambios Requeridos en el Frontend (React / RTK)

### A. Tipado de Datos (`types.ts`)
Deben actualizar `catalogPageSchema` para que Zod parsee correctamente el nuevo mapa de facetas:
```typescript
export const facetOptionSchema = z.object({
    matchValue: z.string(),
    displayLabel: z.string(),
    count: z.number(),
    selected: z.boolean().optional()
});

export const catalogPageSchema = createSpringPageSchema(productApiSchema).extend({
    facets: z.record(z.array(facetOptionSchema)).optional(),
});
```

### B. Eliminación de Lógica Pesada (`filter-facets.ts`)
Ya no es necesario que el frontend descargue los productos y cuente las specs localmente.
- **ELIMINAR** la función `extractFilterFacets`.
- **ELIMINAR** la función `applyProductFilters`.
El componente UI simplemente debe consumir `data.facets` devuelto directamente por React Query / RTK Query y pasarlo al panel lateral.

### C. Estado en UI
La URL del navegador será la única "fuente de verdad" del estado. Si un usuario selecciona la casilla "Apple", el frontend simplemente debe actualizar el `URLSearchParams` a `?Marca=Apple` y disparar un refetch. El Backend hará el resto.
