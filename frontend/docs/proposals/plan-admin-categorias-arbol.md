# Plan de Arquitectura: Gestión de Árbol de Categorías en el Panel de Administración

> **Estado**: En Progreso  
> - **Frontend (Fases 2, 3 y 4)**: **RESUELTO / IMPLEMENTADO EN PRODUCCIÓN**  
> - **Backend (Fase 1)**: **PENDIENTE (Equipo de Backend)**  
> **Área**: Admin / Catálogo / Jerarquía de Categorías

---

## 1. Diagnóstico del Estado Actual en el Repositorio

1. **Componente Huérfano Existente**:
   - En `frontend/src/features/admin/components/CategoryForm/CategoryForm.tsx` existe un formulario básico ("Crear categoría" con nombre y selector de padre).
   - **Limitaciones**: No está montado en ninguna ruta, no permite editar (`PATCH`), no visualiza el árbol ni las ramas, y no maneja eliminación.
2. **Navegación Admin**:
   - En `frontend/src/components/layout/AdminLayout/AdminLayout.tsx` existen pestañas para `Dashboard`, `Usuarios`, `Productos`, `Pedidos` y `Sucursales`. Falta la pestaña `/admin/categorias`.
3. **Estado de las APIs en Backend**:
   - En `backend/src/main/java/com/jeplabs/ecommerce/controller/CategoriaController.java`:
     - `GET /api/categorias`: Retorna el árbol recursivo de categorías.
     - `POST /api/categorias`: Crea categoría raíz o hija.
     - `PATCH /api/categorias/{id}`: Actualiza nombre o padre.
     - **FALTA**: No existe `DELETE /api/categorias/{id}` ni en el controlador ni en `CategoriaService.java`.
4. **Estado en Base de Datos e Integridad Referencial**:
   - En `categorias.parent_id REFERENCES categorias(id)`: **NO** tiene `ON DELETE CASCADE` (comportamiento `RESTRICT`). Si una categoría tiene hijas, la base de datos aborta con error de FK.
   - En `producto_categorias.categoria_id REFERENCES categorias(id)`: **NO** tiene `ON DELETE CASCADE`. Si una categoría tiene productos asociados, la BD aborta con error de FK.

---

## 2. Análisis Crítico: El Problema de la Eliminación en Cascada

En e-commerce existen dos grandes riesgos al eliminar categorías:
1. **Riesgo de Huérfanos Jerárquicos**: Si se elimina "Computación" en cascada ciega, se borran accidentalmente todas sus subcategorías ("Laptops", "Monitores", "Componentes").
2. **Riesgo de Productos Desindexados**: Si se borra una categoría que tiene 80 productos asignados, esos productos pueden quedar invisibles en la navegación pública o provocar inconsistencias.

### Patrón Recomendado por la Industria (Shopify / Magento): Eliminación Bloqueante con Diagnóstico y Prevención
En lugar de permitir cascada destructiva automática:
- **Regla 1 (Subcategorías)**: Si la categoría tiene al menos 1 subcategoría hija, el botón de eliminar se deshabilita o el backend responde con error `409 Conflict`:  
  *«No se puede eliminar la categoría porque contiene X subcategorías. Muévelas o elimínalas primero.»*
- **Regla 2 (Productos asociados)**: Si la categoría tiene productos asignados, no se permite su borrado físico:  
  *«No se puede eliminar porque tiene X productos asociados. Reasigna los productos antes de eliminar.»*
- **Confirmación con Escribir el Nombre**: Para categorías vacías o autorizadas, un modal de confirmación destructiva que exija confirmar conscientemente la acción.

---

## 3. Patrón de Diseño UI/UX: Tree-Table Colapsable (Tabla Jerárquica)

Para visualizar ramas de múltiples niveles (Raíz $\rightarrow$ Subcategoría $\rightarrow$ Sub-subcategoría) de forma intuitiva:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ Gestión de Categorías                                         [ + Nueva Categoría Raíz ]   │
│ Total: 42 categorías  |  Raíces: 9  |  Subcategorías: 33                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ Categoría / Jerarquía               │ Slug                 │ Nivel    │ Acciones            │
├─────────────────────────────────────┼──────────────────────┼──────────┼─────────────────────┤
│ ▼ 📁 Computación                    │ computacion          │ Raíz     │ [➕ Hija] [✏️] [🗑️]   │
│    ├─ ▼ 📁 Laptops                  │ laptops              │ Nivel 1  │ [➕ Hija] [✏️] [🗑️]   │
│    │     └─ 📄 Laptops Gamer        │ laptops-gamer        │ Nivel 2  │           [✏️] [🗑️]   │
│    │     └─ 📄 Ultrabooks           │ ultrabooks           │ Nivel 2  │           [✏️] [🗑️]   │
│    └─ ▶ 📁 Componentes PC           │ componentes-pc       │ Nivel 1  │ [➕ Hija] [✏️] [🗑️]   │
│ ▶ 📁 Audio                          │ audio                │ Raíz     │ [➕ Hija] [✏️] [🗑️]   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Características del Tree-Table:
1. **Indentación visual por nivel**: Cada nivel añade margen izquierdo con líneas guía discretas.
2. **Chevrons colapsables (`▼ / ▶`)**: Permite expandir o contraer ramas enteras para navegar con facilidad en catálogos grandes.
3. **Acciones contextuales por fila**:
   - `➕ Añadir Subcategoría`: Abre el modal con el `parentId` precargado y bloqueado a esa categoría.
   - `✏️ Editar`: Abre el modal permitiendo renombrar o cambiar la categoría padre (con validación de no poder seleccionarse a sí misma como padre).
   - `🗑️ Eliminar`: Abre el modal de confirmación con advertencia de integridad.
4. **Buscador / Filtro Rápido**: Un input en la parte superior que filtre en tiempo real el árbol expandiendo automáticamente las ramas que coincidan con el término.

---

## 4. Plan de Implementación Paso a Paso

### Fase 1: Backend — Endpoint DELETE y Validaciones de Integridad — [ESTADO: PENDIENTE (Equipo Backend)]
1. **Repositorio**:
   - En `ProductoRepository` o consulta nativa, agregar método para verificar existencia de productos vinculados:
     ```java
     @Query("SELECT COUNT(pc) > 0 FROM ProductoCategoria pc WHERE pc.categoriaId = :id")
     boolean tieneProductosAsociados(@Param("id") Long id);
     ```
2. **Servicio (`CategoriaService.java`)**:
   - Implementar método `@Transactional public void eliminar(Long id)`:
     - Validar que la categoría exista.
     - Validar que `categoria.getSubcategorias().isEmpty()` sea `true`. Si no, lanzar `IllegalStateException("No es posible eliminar una categoría con subcategorías activas")`.
     - Validar que no tenga productos asociados. Si no, lanzar `IllegalStateException("No es posible eliminar una categoría con productos asignados")`.
     - Ejecutar `repositorio.delete(categoria)`.
3. **Controlador (`CategoriaController.java`)**:
   - Exponer endpoint protegido:
     ```java
     @DeleteMapping("/{id}")
     @PreAuthorize("hasRole('ADMIN')")
     public ResponseEntity<Void> eliminar(@PathVariable Long id) {
         service.eliminar(id);
         return ResponseEntity.noContent().build();
     }
     ```

---

### Fase 2: Frontend — Capa de API y Estado Global — [ESTADO: IMPLEMENTADO]
1. **Extensión de `categoriesApi.ts` (Implementado)**:
   - Se añadieron `update(id, payload)` (`PATCH /api/categorias/{id}`) y `deleteCategory(id)` (`DELETE /api/categorias/{id}`).
2. **Actualización de `useCategorias.ts` (Implementado)**:
   - Se integraron `updateCategory` y `deleteCategory` con invalidación de caché automática (`reloadCategorias()`).
3. **Mock Service Worker en `handlers.ts` (Implementado)**:
   - Se configuraron handlers para `POST`, `PATCH` y `DELETE /api/categorias/:id` para desarrollo local y tests sin backend.

---

### Fase 3: Frontend — Componentes UI en `features/admin` — [ESTADO: IMPLEMENTADO]
1. **`AdminCategoriesView.tsx` (Implementado)**:
   - Vista principal con contadores estadísticos (Total, Raíces, Subcategorías), barra de búsqueda en tiempo real y botón `+ Nueva Categoría Raíz`.
2. **`AdminCategoriesTable.tsx` (Implementado)**:
   - Tree-Table con colapso/expansión recursivo (`Set<number>`), badges por nivel de profundidad (`depth`), iconos semánticos y acciones por fila (`+ Hija`, `Editar`, `Eliminar`).
3. **`CategoryModalForm.tsx` (Implementado)**:
   - Modal para creación y edición, selector de categorías padre con prevención automática de ciclos jerárquicos y vista previa en vivo del slug.
4. **`DeleteCategoryModal.tsx` (Implementado)**:
   - Modal de confirmación con diagnóstico previo: bloquea el botón si la categoría contiene subcategorías hijas activas.

---

### Fase 4: Routing y Navegación — [ESTADO: IMPLEMENTADO]
1. **Ruta**: Se creó `frontend/src/app/routes/admin/categories.tsx` con carga perezosa (`React.lazy`).
2. **Enrutador**: Se registró `/admin/categorias` protegido para `ROLE_ADMIN` en `AppRouter.tsx`.
3. **Pestaña en Admin**: Se agregó el tab `Categorías` en `AdminLayout.tsx` y la etiqueta de breadcrumb correspondiente.

---

## 5. Resumen de Archivos y Estado Actual

| Capa | Archivo | Estado | Propósito |
|---|---|---|---|
| **Backend** | `CategoriaController.java` & `CategoriaService.java` | **Pendiente** | Endpoint `DELETE /api/categorias/{id}` con validaciones de integridad referencial. |
| **Backend** | `CategoriaServiceTest.java` & `CategoriaControllerTest.java` | **Pendiente** | Pruebas unitarias de rechazo de borrado ante subcategorías o productos vinculados. |
| **Frontend API** | `features/catalog/api/categoriesApi.ts` | **Implementado** | Métodos `update` y `deleteCategory`. |
| **Frontend Hook** | `features/catalog/hooks/useCategorias.ts` | **Implementado** | Mutaciones reactivas y recarga de árbol con invalidación de caché. |
| **Frontend UI** | `features/admin/components/AdminCategoriesView/` | **Implementado** | Vista principal de categorías con estadísticas y búsqueda. |
| **Frontend UI** | `features/admin/components/AdminCategoriesTable/` | **Implementado** | Componente Tree-Table colapsable con indentación por nivel. |
| **Frontend UI** | `features/admin/components/CategoryModalForm/` | **Implementado** | Modal de creación y edición con validación de ciclos. |
| **Frontend UI** | `features/admin/components/DeleteCategoryModal/` | **Implementado** | Modal de diagnóstico y confirmación de borrado. |
| **Frontend Layout**| `components/layout/AdminLayout/AdminLayout.tsx` | **Implementado** | Pestaña de navegación `Categorías` en panel de administración. |
| **Frontend Routing**| `app/routes/admin/categories.tsx` & `AppRouter.tsx` | **Implementado** | Ruta protegida `/admin/categorias`. |
| **Frontend Tests** | `AdminCategoriesView.test.tsx` | **Implementado** | Suite de pruebas unitarias con Vitest y RTL (4 tests pasando). |
