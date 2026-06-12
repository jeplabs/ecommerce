# ESLint — Warnings de React Hooks y optimización

Documento vivo para revisar los warnings de `pnpm run lint`, priorizar mejoras de rendimiento y registrar avances del equipo.

**Última auditoría:** 2026-06-12 · **Errores:** 0 · **Warnings:** 32

---

## Tabla de contenidos

- [Resumen ejecutivo](#resumen-ejecutivo)
- [¿Afectan arquitectura, rendimiento o despliegue?](#afectan-arquitectura-rendimiento-o-despliegue)
- [Configuración actual](#configuración-actual)
- [Inventario por regla](#inventario-por-regla)
- [Plan de acción recomendado](#plan-de-acción-recomendado)
- [Registro de avances](#registro-de-avances)
- [Cómo actualizar este documento](#cómo-actualizar-este-documento)

---

## Resumen ejecutivo

Tras configurar **typescript-eslint** y **eslint-plugin-react-hooks v7** (React 19), el linter analiza todo `src/**/*.{ts,tsx}`. Los warnings **no bloquean** build ni despliegue; están en nivel `warn` en [`eslint.config.ts`](../eslint.config.ts).

| Regla | Cant. | Prioridad revisión | Riesgo funcional | Riesgo rendimiento |
|-------|------:|--------------------|------------------|-------------------|
| [`react-hooks/set-state-in-effect`](#1-react-hooksset-state-in-effect-21) | 21 | Media (gradual) | Bajo | Medio (re-renders / fetch en cadena) |
| [`react-refresh/only-export-components`](#2-react-refreshonly-export-components-8) | 8 | Baja | Ninguno | Bajo (solo HMR en dev) |
| [`react-hooks/exhaustive-deps`](#3-react-hooksexhaustive-deps-0) | **0** | ~~Alta~~ **Cerrada** | — | — |
| [`react-hooks/preserve-manual-memoization`](#4-react-hookspreserve-manual-memoization-3) | 3 | Baja | Bajo | Bajo (hasta usar React Compiler) |

**Conclusión:** la arquitectura FSD y la organización por capas **no están en cuestión**. Los **`exhaustive-deps` de Fase 1 están resueltos** (2026-06-12). Quedan patrones React clásicos (`set-state-in-effect`) y avisos de HMR/compiler pendientes de revisión gradual.

---

## ¿Afectan arquitectura, rendimiento o despliegue?

### Arquitectura (FSD, capas, imports)

**No.** Los warnings no indican violaciones de capas ni mala separación entities/features/widgets. Aparecen en hooks de dominio, providers y UI — justo donde vive la lógica de estado y efectos.

### Rendimiento en runtime (usuario final)

| Fenómeno | Relación con estos warnings |
|----------|----------------------------|
| **Re-renders extra** | `set-state-in-effect` avisa cuando un `useEffect` dispara `setState` de forma síncrona; en hooks de datos puede encadenar loading → datos → hijos re-renderizados. Suele ser aceptable; en listas grandes o árboles profundos puede notarse. |
| **Peticiones HTTP duplicadas** | Si las deps de un effect están mal (`exhaustive-deps`), el mismo fetch puede ejecutarse **más veces** de las necesarias al cambiar referencias de funciones/objetos. **Este es el caso más accionable.** |
| **Datos stale / no actualizados** | Deps incompletas pueden dejar la UI **sin refrescar** cuando cambia una dependencia real. |
| **Context providers** | 8 providers anidados implican que un cambio en un contexto re-renderiza consumidores; es diseño habitual, no un error ESLint. Optimizar contexto (split, memoizar `value`) es mejora aparte. |

### Coste de despliegue (CDN, bundle, servidor)

| Aspecto | Impacto de estos warnings |
|---------|---------------------------|
| **Tamaño del bundle** | **Ninguno.** ESLint no cambia el JS emitido por Vite. |
| **Coste CDN / hosting estático** | **Ninguno** directo. |
| **Coste API / backend** | **Indirecto:** fetch duplicados por deps incorrectas aumentan tráfico al servidor. Relevante a escala, no en dev local. |
| **Build CI** | Solo si el pipeline exige `--max-warnings 0`; hoy `lint` pasa con warnings. |

### Desarrollo (HMR)

`only-export-components` en providers puede provocar **full reload** en lugar de hot update fino al editar un provider. Solo afecta experiencia de desarrollo.

---

## Configuración actual

Archivo: [`eslint.config.ts`](../eslint.config.ts)

```ts
// Reglas en warn (no fallan el lint):
'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
'react-hooks/set-state-in-effect': 'warn',
'react-hooks/preserve-manual-memoization': 'warn',
```

Comprobar estado:

```bash
cd frontend
pnpm run lint
pnpm exec eslint . --quiet          # solo errors
pnpm exec eslint . 2>&1 | tail -3   # resumen final
```

---

## Inventario por regla

### 1. `react-hooks/set-state-in-effect` (21)

**Qué detecta:** `setState` (directo o vía función async que actualiza estado) ejecutado de forma síncrona dentro de `useEffect`.

**Patrón habitual en el proyecto:** cargar datos al montar o cuando cambia una dependencia (`fetchCart`, `fetchPerfil`, `fetchOpciones`, etc.).

**¿Es mala implementación?** No necesariamente. Es el patrón estándar pre–React 19 para datos remotos sin librería de fetching.

**Optimización posible (futuro):**

- [TanStack Query](https://tanstack.com/query) / SWR — cache, deduplicación, stale-while-revalidate.
- React 19 `use()` + Suspense donde encaje.
- Inicializar estado derivado sin effect cuando el dato ya está en props/context.

| Estado | Archivo | Línea | Notas |
|:------:|---------|------:|-------|
| ⬜ | `entities/address/model/useDireccionesLogic.ts` | 56 | fetch al habilitar |
| ⬜ | `entities/cart/model/useCartLogic.ts` | 38 | fetch si autenticado |
| ⬜ | `entities/cart/model/useCartLogic.ts` | 47 | refresh imágenes al cargar catálogo |
| ⬜ | `entities/product/model/useProducts.ts` | 53 | reload productos |
| ⬜ | `entities/shipping/model/useEnvioOpciones.ts` | 45 | fetch opciones envío |
| ⬜ | `entities/user/model/useProfileLogic.ts` | 61 | fetch perfil |
| ⬜ | `features/admin/model/useAdminOrdersLogic.ts` | 88 | carga admin |
| ⬜ | `features/admin/model/useAdminUser.ts` | 46 | carga usuario |
| ⬜ | `features/admin/model/useAdminUsersList.ts` | 58 | lista usuarios |
| ⬜ | `features/admin/ui/AdminOrdersTable/AdminOrdersTable.tsx` | 33 | effect en UI |
| ⬜ | `features/admin/ui/ProductForm.tsx` | 144 | sync formulario |
| ⬜ | `features/auth/model/useAuthLogic.ts` | 55 | init sesión |
| ⬜ | `features/catalog/model/useProductFilterForm.ts` | 24 | sync filtros URL |
| ⬜ | `features/catalog/model/useProductosByCategory.ts` | 22 | fetch categoría |
| ⬜ | `features/checkout/model/useCheckoutLogic.ts` | 109 | fetch direcciones |
| ⬜ | `features/checkout/model/useCheckoutLogic.ts` | 130 | default servicio envío |
| ⬜ | `features/profile/ui/AddressForm/AddressForm.tsx` | 38 | reset form con `initialData` |
| ⬜ | `features/profile/ui/OrdersTab/OrdersTab.tsx` | 48 | carga lazy órdenes |
| ⬜ | `widgets/cart/CartDrawer.tsx` | 33 | animación apertura |
| ⬜ | `widgets/layout/Navbar/Navbar.tsx` | 39 | sync búsqueda con URL |
| ⬜ | `widgets/product-detail/ProductDetailView.tsx` | 31 | resolver producto por slug |

---

### 2. `react-refresh/only-export-components` (8)

**Qué detecta:** el archivo exporta componentes y **no-componentes** (p. ej. `useAuth` junto a `AuthProvider`).

**Impacto:** HMR en dev; **cero en producción**.

**Alternativa:** separar hook en `useAuth.ts` / provider en `AuthProvider.tsx`.

| Estado | Archivo | Línea |
|:------:|---------|------:|
| ⬜ | `app/providers/AuthProvider.tsx` | 8 |
| ⬜ | `app/providers/CartProvider.tsx` | 8 |
| ⬜ | `app/providers/CategoriasProvider.tsx` | 30 |
| ⬜ | `app/providers/CheckoutProvider.tsx` | 13 |
| ⬜ | `app/providers/EnvioOpcionesProvider.tsx` | 8 |
| ⬜ | `app/providers/ProductProvider.tsx` | 8 |
| ⬜ | `app/providers/ProfileProvider.tsx` | 25 |
| ⬜ | `app/providers/ToastProvider.tsx` | 28 |

---

### 3. `react-hooks/exhaustive-deps` (0 — Fase 1 completada)

**Estado:** ✅ **Resuelto** (2026-06-12). Antes: 5 warnings en 4 archivos.

| Estado | Archivo | Fix aplicado |
|:------:|---------|--------------|
| ✅ | `features/checkout/model/useCheckoutSuccessRecommendations.ts` | `useMemo` en `catalog` para evitar `[]` nuevo en cada render |
| ✅ | `shared/ui/Carousel/Carousel.tsx` | deps del autoplay: `[slides]` en lugar de `[slides.length]` |
| ✅ | `widgets/cart/CartDrawer.tsx` | listener Escape usa `onClose` con deps `[isOpen, onClose]` |
| ✅ | `widgets/layout/Navbar/Navbar.tsx` | `closeCart` estable con `useCallback` (alimenta `onClose` del drawer) |
| ✅ | `widgets/layout/ProductCatalog.tsx` | orden extraído a `features/catalog/lib/sort-catalog-products.ts` |

**Prueba manual sugerida:** checkout success (recomendaciones), home (carousel), catálogo (orden + filtros), carrito drawer (Escape + animación cierre).

---

### 4. `react-hooks/preserve-manual-memoization` (3)

**Qué detecta:** deps manuales de `useCallback` no coinciden con lo que inferiría el **React Compiler** (p. ej. `[user?.token]` vs uso de `user` completo).

**Impacto hoy:** ninguno si no usáis React Compiler. **Impacto futuro:** optimizaciones del compiler podrían divergir de la memoización manual.

| Estado | Archivo | Línea | Callback |
|:------:|---------|------:|----------|
| ⬜ | `features/admin/model/useAdminOrdersLogic.ts` | 100 | `updateEstadoOrden` |
| ⬜ | `features/auth/model/useAuthLogic.ts` | 217 | `desactivarUsuario` |
| ⬜ | `features/auth/model/useAuthLogic.ts` | 235 | `activarUsuario` |

---

## Plan de acción recomendado

### Fase 1 — Revisión puntual (impacto real) ✅

1. ~~Corregir los **5 `exhaustive-deps`**.~~ Hecho 2026-06-12.
2. Tras cada fix: `pnpm run lint` + prueba manual del flujo afectado.
3. Actualizar tabla de estado y [Registro de avances](#registro-de-avances).

### Fase 2 — Optimización de datos (opcional, mayor esfuerzo)

1. Evaluar **TanStack Query** para entities con muchos fetch (`cart`, `product`, `order`, `checkout`).
2. Reduciría warnings `set-state-in-effect` y centralizaría cache/deduplicación.
3. Documentar decisión del equipo aquí antes de implementar.

### Fase 3 — Providers y HMR (opcional)

1. Separar hooks de providers solo si el HMR molesta en dev.
2. Valorar `useMemo` en `value` de contexts muy volátiles (mejora rendimiento, no ESLint).

### Fase 4 — React Compiler (futuro)

1. Revisar los 3 `preserve-manual-memoization` al activar el compiler.
2. Ajustar deps o eliminar `useCallback` redundantes según recomiende la migración.

### Política CI (decisión pendiente)

| Opción | Comportamiento |
|--------|----------------|
| Actual | `lint` pasa con warnings |
| Estricto | `eslint . --max-warnings 0` falla hasta limpiar |
| Intermedio | `--max-warnings 32` y bajar número en cada PR |

---

## Registro de avances

Añadir entradas **más recientes arriba**. Incluir PR/commit, regla, archivos y resultado de lint.

| Fecha | Autor | Cambio | Warnings restantes |
|-------|-------|--------|-------------------|
| 2026-06-12 | — | **Fase 1:** 5× `exhaustive-deps` resueltos (checkout success, carousel, cart drawer + navbar, product catalog + `sort-catalog-products.ts`) | **32** |
| 2026-05-28 | — | Documento inicial; inventario tras migración ESLint + TS | **37** |

### Notas de revisión por ítem

Usar esta sección para decisiones (“fix aplicado”, “intencional — eslint-disable con comentario”, “pospuesto a Fase 2”).

#### `exhaustive-deps` ✅ (2026-06-12)

- **`useCheckoutSuccessRecommendations.ts`** — `useMemo(() => (productos ?? []), [productos])`. Correcto.
- **`Carousel.tsx`** — deps `[slides]`. Correcto.
- **`CartDrawer.tsx`** + **`Navbar.tsx`** — `onClose` estable + Escape con `[isOpen, onClose]`.
- **`ProductCatalog.tsx`** — `sortCatalogProducts()` en `features/catalog/lib/sort-catalog-products.ts`.

#### Otros

_(añadir según el equipo avance)_

---

## Cómo actualizar este documento

1. Ejecutar `pnpm run lint` y anotar el total del resumen final (`✖ N problems`).
2. Listar warnings por regla:

   ```bash
   pnpm exec eslint . --format json > eslint-report.json
   ```

   Extraer rutas con tu editor o script; actualizar tablas e inventario.

3. Marcar ítems resueltos: ⬜ → ✅.
4. Añadir fila en **Registro de avances** con fecha y conteo nuevo.
5. Si cambiáis severidad de reglas en `eslint.config.ts`, actualizar [Configuración actual](#configuración-actual).

---

## Referencias

- [React — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) v7 (reglas React 19)
- [typescript-eslint](https://typescript-eslint.io/)
- Arquitectura del proyecto: [architecture-fsd.md](./architecture-fsd.md)
