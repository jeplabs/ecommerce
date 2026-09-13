# Plan de Mejora y Arquitectura: Filtros con Facetas y Paginación Unificada en Catálogo

**Fecha:** 13 de Septiembre de 2026  
**Módulo:** Catálogo / Productos / Filtros  
**Audiencia:** Equipo Backend (Spring Boot) & Equipo Frontend (React)

---

## 📌 1. Visión General y Mapeo del Código Existente

Este plan toma como **punto de referencia directo la arquitectura actual del proyecto** en ambos repositorios (`backend/` y `frontend/`).

### Archivos de Referencia en el Código Actual:

#### Frontend:
- **`filter-facets.ts`** (`frontend/src/features/catalog/lib/filter-facets.ts`): Contiene `extractFilterFacets` (extracción dinámica de specs en JS) y `applyProductFilters` (filtrado en memoria).
- **`ProductFilters.tsx` & `ProductFiltersPanel.tsx`** (`frontend/src/features/catalog/ui/ProductFilters/`): Renderizado de paneles de filtros en Desktop y Mobile Drawer.
- **`productApi.ts`** (`frontend/src/entities/product/api/productApi.ts`): Servicios `getAll` y `getByCategory`.
- **`types.ts`** (`frontend/src/entities/product/model/types.ts`): Esquema `productPageSchema` basado en `createSpringPageSchema`.

#### Backend:
- **`ProductoController.java`** (`backend/src/main/java/com/jeplabs/ecommerce/controller/ProductoController.java`): Endpoints `@GetMapping("/api/productos")` con `@PageableDefault`.
- **`ProductoRepository.java`** (`backend/src/main/java/com/jeplabs/ecommerce/domain/producto/ProductoRepository.java`): Consultas JPA para productos por categoría y disponibilidad.
- **`ProductoService.java`** (`backend/src/main/java/com/jeplabs/ecommerce/domain/producto/ProductoService.java`): Lógica de negocio del catálogo.
- **`DatosRespuestaProducto.java`** (`backend/src/main/java/com/jeplabs/ecommerce/domain/producto/DatosRespuestaProducto.java`): DTO de respuesta actual de productos.

---

## 🚀 2. Arquitectura de Referencia (Estándar de la Industria)

La arquitectura de oro en e-commerce (Shopify, Algolia, Elasticsearch, MercadoLibre) consolida el catálogo, la paginación y las facetas en **un solo contrato HTTP unificado**:

```
Client (React)  ─── GET /api/productos?categoriaId=2&marca=Apple&page=0&size=12 ───►  Backend (Spring Boot)
                ◄─── 200 OK: { content: [12], totalElements: 20, facets: {...} } ───  
```

---

## 🛠️ 3. Paso a Paso de Implementación: Backend (Spring Boot)

### Paso 1: Definir el DTO de Respuesta Unificado (`DatosRespuestaCatalogoPage.java`)
Ubicación: `backend/src/main/java/com/jeplabs/ecommerce/domain/producto/DatosRespuestaCatalogoPage.java`

Reemplazar/extender el retorno genérico de Spring `Page<DatosRespuestaProducto>` para incluir el mapa de facetas calculadas:

```java
package com.jeplabs.ecommerce.domain.producto;

import java.util.List;
import java.util.Map;

public record DatosRespuestaCatalogoPage(
    List<DatosRespuestaProducto> content,
    int number,
    int size,
    long totalElements,
    int totalPages,
    boolean first,
    boolean last,
    Map<String, Object> facets
) {}
```

### Paso 2: Implementar Consultas Personalizadas en Repository (`ProductoRepositoryCustom.java`)
Ubicación: `backend/src/main/java/com/jeplabs/ecommerce/domain/producto/ProductoRepositoryCustomImpl.java`

Usar PostgreSQL JSONB Aggregations o JPA Criteria API para calcular los productos paginados y las facetas en el contexto filtrado actual:

```java
@Repository
public class ProductoRepositoryCustomImpl implements ProductoRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    public DatosRespuestaCatalogoPage findCatalogoPaginadoYFacetado(
        Long categoriaId,
        String search,
        Double precioMin,
        Double precioMax,
        MultiValueMap<String, String> specs,
        Pageable pageable
    ) {
        // 1. Predicates de filtrado (JPA Specification / Criteria)
        // 2. Consulta de Paginación (LIMIT size OFFSET page * size)
        // 3. Agregación de Facetas (GROUP BY spec_key, spec_value)
        // 4. Retornar DatosRespuestaCatalogoPage ensamblado
    }
}
```

#### Estructura del objeto `facets` devuelto al cliente:
```json
{
  "content": [ ... 12 productos ... ],
  "totalElements": 20,
  "totalPages": 2,
  "number": 0,
  "size": 12,
  "facets": {
    "precio": { "min": 1500.00, "max": 1200000.00 },
    "MARCA": [
      { "val": "apple", "label": "Apple", "count": 20, "selected": true },
      { "val": "samsung", "label": "Samsung", "count": 18, "selected": false }
    ],
    "RAM": [
      { "val": "16gb", "label": "16 GB", "count": 14, "selected": false },
      { "val": "32gb", "label": "32 GB", "count": 6, "selected": false }
    ]
  }
}
```

### Paso 3: Actualizar `ProductoController.java` y `ProductoService.java`
Ubicación: `backend/src/main/java/com/jeplabs/ecommerce/controller/ProductoController.java`

```java
@GetMapping("/api/productos")
public ResponseEntity<DatosRespuestaCatalogoPage> getProductos(
        @RequestParam(required = false) Long categoriaId,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Double precioMin,
        @RequestParam(required = false) Double precioMax,
        @RequestParam MultiValueMap<String, String> allParams,
        @PageableDefault(size = 12, sort = "nombre") Pageable pageable) {

    DatosRespuestaCatalogoPage resultado = productoService.obtenerCatalogoFacetado(
        categoriaId, search, precioMin, precioMax, allParams, pageable
    );
    return ResponseEntity.ok(resultado);
}
```

---

## 🎨 4. Paso a Paso de Implementación: Frontend (React)

### Paso 1: Actualizar Esquemas Zod y Tipos (`frontend/src/entities/product/model/types.ts`)
Extender `productPageSchema` para aceptar la propiedad `facets`:

```ts
export const facetOptionSchema = z.object({
    val: z.string(),
    label: z.string(),
    count: z.number(),
    selected: z.boolean().optional(),
});

export const catalogPageSchema = createSpringPageSchema(productApiSchema).extend({
    facets: z.record(z.array(facetOptionSchema)).optional(),
});
```

### Paso 2: Actualizar Llamadas en `productApi.ts` (`frontend/src/entities/product/api/productApi.ts`)
```ts
export async function getCatalogo(searchParams: URLSearchParams): Promise<CatalogPageApi> {
    const response = await fetch(`${API_URL}/api/productos?${searchParams}`);
    return handleProductPageJson(response, 'Error al obtener catálogo');
}
```

### Paso 3: Refactorizar `filter-facets.ts` e Integrar Conteos en `ProductFiltersPanel.tsx`
- Desactivar la extracción manual iterativa `extractFilterFacets` en JS cuando la respuesta traiga `facets` desde el backend.
- En `ProductFiltersPanel.tsx`, mostrar al lado de cada checkbox el conteo devuelto por la API: `Apple (24)`.
- Ocultar o deshabilitar opciones que tengan `count: 0`.

---

## 🎨 5. Manejo de Filtros Extensos y Specs Dinámicas en UI/UX (Acordeones y Limpieza)

Para evitar el scroll vertical excesivo cuando existen múltiples especificaciones (ej. 15 tipos de specs y 20 marcas), el frontend debe aplicar las siguientes reglas de UI/UX:

### 1. Sistema de Acordeones Colapsables (`Accordion System`)
- Cada clave de especificación (`Marca`, `RAM`, `Almacenamiento`, `Resolución`) se renderiza como un bloque desplegable independiente.
- **Regla de Apertura:** Los 2 o 3 filtros más relevantes (ej. *Rango de Precio* y *Marca*) o aquellos que contengan opciones seleccionadas vienen **abiertos por defecto**. Los demás vienen **colapsados**.

### 2. Límite Visual de Opciones ("Ver más (+8) / Ver menos")
- Dentro de cada acordeón, se muestran visiblemente solo las **primeras 5 opciones principales** (ordenadas por `count` de mayor a menor).
- Al pie de la quinta opción se incluye un botón colapsable: `+ Ver 15 marcas más`. Al pulsar, expande la lista completa dentro del acordeón sin refrescar la página.

### 3. Ocultamiento Dinámico de Facetas Irrelevantes
- Si una búsqueda o categoría no contiene productos con determinada especificación (ej. `Socket CPU` en Celulares), la faceta se **elimina automáticamente del panel** al recibir `count: 0` desde el motor de facetas.

---

## 🔄 6. Flujo Completo de Ejemplo (Ejecución Usuario)

1. **Navegación Inicial:** Usuario entra a `/catalogo` ➔ Petición `GET /api/productos?page=0&size=12`.
2. **Respuesta Inicial:** Backend filtra en BD, devuelve 12 productos, `totalElements: 56`, `totalPages: 5` y el mapa de facetas globales.
3. **Selección de Filtro:** Usuario marca la casilla `Apple` ➔ URL cambia a `/catalogo?marca=Apple&page=1` ➔ Petición `GET /api/productos?marca=Apple&page=0&size=12`.
4. **Filtrado en BD:** Backend ejecuta `WHERE marca = 'Apple'`, encuentra `totalElements: 20`, devuelve los 12 productos de la pág 1, `totalPages: 2`, y actualiza los conteos de facetas.
5. **Navegación Paginada:** `<Pagination />` renderiza 2 páginas. Al pulsar la página 2 ➔ Petición `GET /api/productos?marca=Apple&page=1&size=12` ➔ Backend responde los 8 productos restantes (`LIMIT 12 OFFSET 12`).
