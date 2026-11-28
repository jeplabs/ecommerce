# Guía de Integración para Frontend: Buscador Global Multicampo y Sinónimos

> **Contexto**: El backend completó la **Fase 2** de [buscador-global-catalogo-multicampo.md](./buscador-global-catalogo-multicampo.md), incorporando búsqueda multicampo con normalización diacrítica, plurales, prevención de falsos positivos, ordenamiento automático por relevancia y gestión dinámica de sinónimos en PostgreSQL con caché en RAM.  
> **Estado Frontend**: **100% IMPLEMENTADO** (`searchSynonymsApi.ts`, invalidación de `catalogoCache`, `fetchWithAuth` en `productsAdminApi.ts`, opción `"Más relevantes"` en `SortSelector`, vista administrativa en `/admin/sinonimos` y pruebas Vitest + `vitest-axe`).

---

## 1. Comportamiento Definitivo de Búsqueda

### 1.1. Catálogo Público (`GET /api/productos`)

- **Parámetros soportados**:
  - `search` *(o alias legacy `nombre`)*: consulta libre (máx. `150` caracteres / `10` tokens efectivos).
  - `categoriaId`, `precioMin`, `precioMax`, facetas dinámicas de `specs`, `page`, `size`, `sort`.
- **Campos indexados y ponderación**:
  1. `SKU` *(coincidencia exacta o parcial — mayor prioridad)*
  2. `nombre` *(coincidencia exacta, prefijo y bonus por frase completa)*
  3. `categorias` *(nombres de las categorías asignadas al producto)*
  4. `specs` *(únicamente **valores** del JSONB; las llaves como `"Pantalla"` no contaminan resultados)*
  5. `descripcion` *(menor peso)*
  - En empates de relevancia, productos `DISPONIBLE` tienen prioridad sobre `SIN_STOCK`.
- **Reglas lingüísticas**:
  - Insensible a tildes y `ñ` (`"raton"` $\leftrightarrow$ `"Ratón"`, `"diseno"` $\leftrightarrow$ `"Diseño"`).
  - Coincidencia **AND** no posicional entre palabras (ignorando conectores como `de`, `para`, `con`, `la`, `el` cuando hay términos significativos).
  - Códigos técnicos con o sin separadores (`"rtx 4050"` $\leftrightarrow$ `"RTX4050"`, `"wifi"` $\leftrightarrow$ `"Wi-Fi 6E"`, `"32gb"` $\leftrightarrow$ `"32 GB"`).
  - Tokens cortos (`<= 3` caracteres como `"lg"`, `"pc"`, `"ram"`) exigen coincidencia de palabra completa para evitar falsos positivos (`"lg"` no coincide con `"algunos"`).
- **Ordenamiento automático por relevancia**:
  - Cuando el frontend envía `?search=...` **sin parámetro `sort`** (comportamiento actual de `toCatalogApiSearchParams` en `src/features/catalog/lib/catalog-query-params.ts`), el backend ordena automáticamente por **relevancia descendente**.
  - Si no hay `search` ni `sort`, mantiene el orden alfabético `nombre,asc` de siempre.
  - Si el usuario selecciona un orden explícito en `SortSelector` (`precioVenta,asc|desc`, `nombre,asc|desc`, `createdAt,desc`), ese `sort` prevalece sobre la relevancia.
  - También se acepta `sort=relevancia,desc` si el equipo desea mostrar una opción explícita *"Más relevantes"* en `SortSelector` cuando `searchTerm` está activo.

### 1.2. Panel Administrativo (`GET /api/productos/admin`)

- El filtro `?nombre=...` ahora aplica el mismo motor multicampo (`SKU`, `nombre`, `categorías`, `descripción` y `specs`), insensible a tildes, multi-palabra y con sinónimos.
- **Sugerencia UI**: Actualizar el `placeholder` del buscador en `AdminProductFilters` (ej. *"Buscar por nombre, SKU, categoría o especificación..."*).

---

## 2. Nueva API REST: Gestión de Sinónimos (`ROLE_ADMIN`)

Los grupos de sinónimos se almacenan en PostgreSQL (`busqueda_sinonimos`) con **caché en memoria e invalidación instantánea** en el servidor: cualquier alta, edición, cambio de estado o eliminación surte efecto **sin reiniciar el backend**.

**Base path**: `/api/admin/busqueda/sinonimos` *(protegido con `ROLE_ADMIN`: `401` sin sesión, `403` con `ROLE_CUSTOMER`)*.

| Método | Ruta | Body / Params | Respuesta exitosa | Errores comunes |
|---|---|---|---|---|
| `GET` | `/api/admin/busqueda/sinonimos` | — | `200 OK` (`SearchSynonymApi[]`) | `401`, `403` |
| `GET` | `/api/admin/busqueda/sinonimos/{id}` | — | `200 OK` (`SearchSynonymApi`) | `401`, `403`, `404` |
| `POST` | `/api/admin/busqueda/sinonimos` | `CreateSearchSynonymRequest` | `201 Created` (`SearchSynonymApi`) | `400`, `401`, `403` |
| `PUT` | `/api/admin/busqueda/sinonimos/{id}` | `UpdateSearchSynonymRequest` | `200 OK` (`SearchSynonymApi`) | `400`, `401`, `403`, `404` |
| `PATCH` | `/api/admin/busqueda/sinonimos/{id}/estado` | *(sin body)* | `200 OK` (`SearchSynonymApi`) | `401`, `403`, `404` |
| `DELETE` | `/api/admin/busqueda/sinonimos/{id}` | — | `204 No Content` | `401`, `403`, `404` |

### Ejemplo de Request (`POST` / `PUT`)

```json
{
  "nombreGrupo": "laptops",
  "terminos": ["laptop", "notebook", "portátil", "ultrabook"],
  "activo": true
}
```

### Ejemplo de Response (`200` / `201`)

```json
{
  "id": 1,
  "nombreGrupo": "laptops",
  "terminos": ["laptop", "notebook", "portatil", "ultrabook"],
  "activo": true,
  "createdAt": "2026-11-27T22:30:00",
  "updatedAt": "2026-11-27T22:30:00"
}
```

### Reglas de Validación del Backend (`400 Bad Request`)

- `nombreGrupo`: obligatorio, único (case-insensitive), entre `2` y `100` caracteres.
- `terminos`: lista obligatoria con al menos **2 términos alfanuméricos distintos** de mínimo `2` caracteres tras normalizar tildes/símbolos; la suma serializada con comas no debe superar `500` caracteres.
- `activo`: opcional en `POST` (por defecto `true`) y opcional en `PUT` (mantiene el valor actual si es `null`).

---

## 3. Contratos TypeScript y Zod Sugeridos (`frontend/AGENTS.md`)

Siguiendo las convenciones de `frontend/AGENTS.md` (sufijos `Api`, `Schema`, `FormValues` y validación obligatoria con `parseApi`):

```ts
import { z } from 'zod';
import { positiveIntSchema } from '@/utils/zod-helpers';

export const searchSynonymApiSchema = z.object({
    id: positiveIntSchema,
    nombreGrupo: z.string(),
    terminos: z.array(z.string()),
    activo: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type SearchSynonymApi = z.infer<typeof searchSynonymApiSchema>;

export const saveSearchSynonymRequestSchema = z.object({
    nombreGrupo: z.string().trim().min(2).max(100),
    terminos: z.array(z.string().trim().min(2)).min(2),
    activo: z.boolean().optional(),
});

export type SaveSearchSynonymRequest = z.infer<typeof saveSearchSynonymRequestSchema>;
```

---

## 4. Mejoras Recomendadas en el Cliente Existente

### 4.1. Invalidar `catalogoCache` al modificar sinónimos
En `src/features/catalog/api/catalogApi.ts`, las respuestas de `GET /api/productos` se cachean en memoria por **5 minutos** (`CACHE_TTL_MS = 5 * 60 * 1000`).  
Cuando implementen el cliente `searchSynonymsApi.ts`, invoquen `invalidateCatalogoCache()` tras `create`, `update`, `toggleStatus` y `remove` para que los cambios de sinónimos se reflejen inmediatamente al buscar en `/catalogo`.

### 4.2. Usar `fetchWithAuth` en endpoints administrativos
- Al crear `searchSynonymsApi.ts` (y progresivamente en `productsAdminApi.ts`), utilizar `fetchWithAuth` de `@/lib/http-session` en lugar de `fetch()` crudo con `localStorage.getItem('token')`, asegurando la renovación silenciosa del JWT de `ADMIN` (que expira cada 10 min) mediante la cookie `HttpOnly` (`/api/auth/refresh`) y lanzando `ApiError(getErrorMessage(raw, fallback), response.status, raw)`.

### 4.3. Opción *"Más relevantes"* en `SortSelector` *(Opcional)*
- Hoy `SortSelector` muestra la opción vacía por defecto cuando no hay `sort` en la URL, lo cual ya activa automáticamente el orden por relevancia en el backend cuando existe `?search=...`.
- Si desean hacerlo explícito al usuario, pueden mostrar la etiqueta `"Más relevantes"` como opción por defecto cuando `searchTerm.trim().length > 0` (o mapear `'relevance'` $\rightarrow$ `'relevancia,desc'` en `mapCatalogSortToBackend`).

### 4.4. Sincronizar Mocks de MSW (`src/test/msw/handlers.ts`)
- En el handler mock de `GET /api/productos`, extender el filtro de `search` para incluir `descripcion`, valores de `specs` y nombres de `categorias` normalizando tildes (`normalize('NFD')`).
- Añadir un registry y handlers MSW para `/api/admin/busqueda/sinonimos` cuando se construya la UI administrativa (con pruebas Vitest + RTL).

---

## 5. Sugerencia de UI para Gestión de Sinónimos en `/admin`

Cuando decidan exponer la gestión en el panel de administración (nueva pestaña `/admin/sinonimos` o sub-sección en `/admin/productos`), reutilizar exclusivamente los primitivos de `src/components/ui/`:
- **Tabla**: columnas `Grupo`, `Términos` (badges/chips), `Estado` (`Activo`/`Inactivo` con toggle rápido a `PATCH /{id}/estado`) y `Acciones` (`Editar`, `Eliminar`).
- **Formulario Modal**: input de `nombreGrupo` + entrada de términos por chips o separados por coma (validando en vivo mínimo 2 términos únicos y mostrando una vista previa normalizada).
- **Ruta protegida**: `React.lazy` bajo `/admin/sinonimos` con `ROLE_ADMIN`, siguiendo el mismo patrón de `AdminCategoriesView` y `AdminBannersView`.
