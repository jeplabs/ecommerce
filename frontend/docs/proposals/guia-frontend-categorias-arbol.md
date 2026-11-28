# Guía de Alineación Técnica para Frontend: Árbol de Categorías

> **Contexto**: El backend completó la Fase 1 de [plan-admin-categorias-arbol.md](./plan-admin-categorias-arbol.md) (`DELETE /api/categorias/{id}`, validaciones de integridad referencial, prevención de ciclos transitivos y límite de **5 niveles** de profundidad).  
> **Compatibilidad**: La UI actual en `/admin/categorias` ya funciona con el backend desplegado gracias a `getErrorMessage()` en `src/lib/api/api-error.ts`, pero este documento detalla los contratos definitivos y **6 mejoras recomendadas** para endurecer la experiencia en producción.

---

## 1. Contratos Definitivos del Backend (`/api/categorias`)

### `DELETE /api/categorias/{id}` (`ROLE_ADMIN`)

| Escenario | HTTP Status | Body de Respuesta | Cuándo ocurre |
|---|---|---|---|
| Eliminación exitosa | `204 No Content` | *(vacío)* | Categoría existe, `0` subcategorías hijas y `0` productos vinculados. |
| No autenticado / JWT vencido | `401 Unauthorized` | `{"error": "..."}` | Falta `Authorization: Bearer` o el Access Token expiró. |
| Sin rol administrador | `403 Forbidden` | `{"error": "..."}` | Usuario autenticado con `ROLE_CUSTOMER`. |
| Categoría inexistente | `404 Not Found` | `{"error": "Categoría no encontrada con ID: X"}` | El ID ya fue eliminado por otro admin o no existe. |
| Bloqueo por subcategorías | `409 Conflict` | `{"error": "No se puede eliminar la categoría «...» porque contiene X subcategorías...", "codigo": "CATEGORIA_CON_SUBCATEGORIAS"}` | Tiene $\ge 1$ categoría hija en `categorias.parent_id`. |
| Bloqueo por productos | `409 Conflict` | `{"error": "No se puede eliminar la categoría «...» porque tiene X productos asociados...", "codigo": "CATEGORIA_CON_PRODUCTOS"}` | Tiene $\ge 1$ producto vinculado en `producto_categorias` (incluyendo ocultos o descontinuados). |

### Reglas en `POST /api/categorias` y `PATCH /api/categorias/{id}`

- **Profundidad máxima de 5 niveles** (Raíz = nivel 1 hasta nivel 5):
  - Crear una subcategoría bajo un nodo de nivel 5 o mover una rama cuya altura total supere 5 niveles responde **HTTP `400 Bad Request`** con `{"error": "... 5 niveles ..."}`.
- **Prevención de ciclos transitivos**:
  - Asignar como padre a la misma categoría o a cualquier descendiente en `PATCH` responde **HTTP `400 Bad Request`**.
- **Slugs**:
  - Se recortan espacios y guiones extremos (`^-+|-+$`) tras normalizar acentos y caracteres especiales. Nombres compuestos únicamente por símbolos responden `400 Bad Request`.

---

## 2. [Prioridad Alta] Usar `fetchWithAuth` en `categoriesApi.ts`

En el backend, el Access Token de `ADMIN` expira cada **10 minutos (`600s`)**. Actualmente `frontend/src/features/catalog/api/categoriesApi.ts` utiliza `fetch()` nativo y, ante un `401`, ejecuta `throwSessionExpired()` de inmediato sin intentar renovar el token con la cookie `HttpOnly` (`/api/auth/refresh`).

**Acción recomendada**:
1. En `create`, `update` y `deleteCategory`, reemplazar `fetch(...)` por `fetchWithAuth(...)` de `src/lib/http-session.ts` (que gestiona automáticamente el refresh y reintento en `401`).
2. Eliminar la lectura legacy `localStorage.getItem('token')`.
3. Lanzar `new ApiError(getErrorMessage(raw, fallback), response.status, raw)` (desde `src/lib/api/api-error.ts`) en lugar de `new Error(...)`, para conservar `status` y `data.codigo` en la capa de UI.

---

## 3. [UX Admin] Diagnóstico y Acción Directa en `DeleteCategoryModal`

Actualmente `DeleteCategoryModal.tsx` cierra el modal solo si `onConfirm` devuelve `true`, y ante un `409` muestra un toast flotante dejando el modal abierto sin contexto accionable.

**Acción recomendada** (capturando `ApiError`):
- **`err.status === 409`**:
  - Mostrar `err.message` dentro de un bloque de advertencia inline en el propio `DeleteCategoryModal` (reutilizando el estilo `.warningBox`).
  - Si `(err.data as { codigo?: string })?.codigo === 'CATEGORIA_CON_PRODUCTOS'`, renderizar un enlace directo a `/admin/products?categoriaId=${category.id}` (*«Ver y reasignar productos de esta categoría →»*) para que el administrador pueda resolver el bloqueo en un clic.
- **`err.status === 404`**:
  - Si otro administrador ya eliminó la categoría, invocar `reloadCategorias()` para sincronizar el árbol y cerrar el modal.

---

## 4. [Estado Global y Caché] Unificar `useCategorias` y Catálogo Vacío

1. **Consumo único desde Contexto**:
   - `AdminCategoriesView` y `CategoriasNav` consumen `useCategorias` desde `@/app/providers` (`CategoriasProvider`), mientras que vistas como `CategoryProductsView`, `ProductDetailView` y `useProductosByCategory` importan el hook directo desde `features/catalog/hooks/useCategorias.ts`.
   - Unificar todas las importaciones hacia `@/app/providers` asegura que crear, editar o eliminar categorías refleje cambios al instante en toda la aplicación montada.
2. **Cacheo de arreglo vacío (`[]`)**:
   - En `features/catalog/hooks/useCategorias.ts`, la condición `if (Array.isArray(data) && data.length > 0)` impide cachear un catálogo vacío tras eliminar la última categoría raíz. Cambiar a `if (Array.isArray(data)) cachedCategories = data;` y verificar `cachedCategories !== null`.

---

## 5. [UI Tree-Table y Formulario] Ajustes Finos de Experiencia

1. **Auto-expansión al crear subcategoría**:
   - En `AdminCategoriesTable.tsx`, `expandedIds` solo se inicializa en el primer render (`useState(() => ...)`). Si se crea una subcategoría usando `+ Hija` sobre una rama colapsada, la nueva fila queda oculta. Agregar el `parentId` utilizado a `expandedIds` hace visible el nuevo nodo inmediatamente.
2. **Paridad exacta de `generarSlugPreview` y límite de 5 niveles en `CategoryModalForm.tsx`**:
   - Agregar `.replace(/^-+|-+$/g, '')` al final de `generarSlugPreview` para coincidir exactamente con `Categoria.generarSlug()` del backend (ej. `"Laptops (Gamer)"` → `"laptops-gamer"`).
   - Opcionalmente, deshabilitar en el `<Select>` de categoría padre las opciones que ya están en nivel 5 (o advertir si mover una rama supera 5 niveles).

---

## 6. [Limpieza y Testing MSW] Deuda Técnica Menor

- **Eliminar componente huérfano**: Remover `frontend/src/features/admin/components/CategoryForm/` y su exportación en `features/admin/components/index.ts` (reemplazado por `CategoryModalForm`).
- **Barrels consistentes**: Añadir `index.ts` en `AdminCategoriesView/`, `AdminCategoriesTable/`, `CategoryModalForm/` y `DeleteCategoryModal/`.
- **Simular `409 Conflict` en MSW**: En `frontend/src/test/msw/handlers.ts`, actualizar `http.delete('/api/categorias/:id')` para devolver `409` con `{"error": "...", "codigo": "CATEGORIA_CON_PRODUCTOS"}` cuando algún producto en `products-registry` pertenezca a esa categoría, permitiendo cubrir el flujo de bloqueo en Vitest y Cypress.
