# Guía de Testing de Accesibilidad Web (a11y) con axe-core

Esta guía documenta la infraestructura, configuración y el **Plan de Recorrido Centrado en el Usuario** para garantizar que la plataforma cumpla con los estándares internacionales de accesibilidad **WCAG 2.1 nivel AA**.

---

## 1. Infraestructura y Configuración Técnica

Para validar accesibilidad de manera automatizada se utiliza el motor **`axe-core`** integrado con el runner de pruebas unitarias mediante **`vitest-axe`**.

### 1.1. Dependencias
- `vitest-axe`: Provee la función `axe(container)` y el matcher `.toHaveNoViolations()`.

### 1.2. Configuración en `src/test/setup.ts`
Los matchers de axe se registran globalmente en la suite de pruebas:
```typescript
import '@testing-library/jest-dom/vitest';
import * as axeMatchers from 'vitest-axe/matchers';
import { expect } from 'vitest';

expect.extend(axeMatchers);
```

### 1.3. Compatibilidad de Tipos TypeScript con Vitest 4
Debido a que `vitest-axe` utiliza la convención legacy `namespace Vi`, para Vitest 4 se añadió la augmentación de módulo oficial en `src/test/vitest-axe.d.ts`:
```typescript
import 'vitest';
import type { Result } from 'axe-core';

interface NoViolationsMatcherResult {
    message(): string;
    pass: boolean;
    actual: Result[];
}

interface AxeMatchers {
    toHaveNoViolations(): NoViolationsMatcherResult;
}

declare module 'vitest' {
    interface Assertion<T = any> extends AxeMatchers {}
    interface AsymmetricMatchersContaining extends AxeMatchers {}
}
```
Esto resuelve de forma nativa el error de TypeScript `Property 'toHaveNoViolations' does not exist on type 'Assertion<AxeResults>'`.

---

## 2. Plan de Recorrido de Accesibilidad Centrado en el Usuario (Roadmap)

El plan de auditoría no comienza por herramientas internas, sino que recorre el viaje natural del comprador: desde su llegada a la tienda hasta la compra y su perfil personal, dejando el panel administrativo para el cierre.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           ROADMAP DE ACCESIBILIDAD (USER JOURNEY)                           │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
  [1. Layout Público y Home]   ──►  [2. Catálogo y Búsqueda]   ──►  [3. Detalle de Producto]
   Navbar, Categorías, Footer         Filtros, Cards, Grid            Galería, Specs, Compra
                                                                                │
  ┌─────────────────────────────────────────────────────────────────────────────┘
  ▼
  [4. Carrito y Checkout]      ──►  [5. Autenticación]         ──►  [6. Perfil y Órdenes]
   CartDrawer, Envíos, Pagos          Login, Registro, Reset          Direcciones, Favoritos
                                                                                │
  ┌─────────────────────────────────────────────────────────────────────────────┘
  ▼
  [7. Panel de Administración]
   Dashboard, Productos, Categorías, Sucursales
```

---

## 3. Matriz de Progreso de Auditorías

| Etapa | Componentes Clave | Estado | Hallazgos y Acciones Realizadas |
|---|---|---|---|
| **1. Layout Público & Home** | `Navbar`, `CategoriasNav`, `Footer`, `HomePage` | **Completado (100%)** | `Navbar`, `CategoriasNav` y `Footer` auditados con 0 violaciones. Se corrigieron `heading-order` y `link-name` en Footer; landmark `<nav>`, `<button>` semántico y atributos `aria-expanded`/`aria-label` en CategoriasNav. |
| **2. Catálogo y Búsqueda** | `ProductCard`, `ProductCatalog`, `ProductFilters`, `SortSelector`, `Pagination` | **Completado (100%)** | `ProductCard`, `ProductFilters` y `ProductCatalog` auditados con 0 violaciones. Se corrigió la violación `aria-allowed-role` en el drawer de filtros móvil (`<aside role="dialog">` -> `<div role="dialog">`); validados estados con stock, agotados, filtros facetados y paginación. |
| **3. Detalle de Producto** | `ProductDetailView`, `ProductGallery`, `ProductInfo`, `ProductTabs`, selector de compra | **Completado (100%)** | `ProductGallery`, `ProductInfo`, `ProductTabs` y `ProductDetailView` auditados con 0 violaciones. Se corrigieron en `ProductInfo` las violaciones `list` (elementos `<li>` requeridos en listas) y `heading-order` (`<h4>` -> `<h2>`); validadas pestañas ARIA, galería de miniaturas, breadcrumbs y selector de cantidad. |
| **4. Carrito y Checkout** | `CartDrawer`, `CartView`, `PickupBranchSelector`, `OrderSummary`, `CheckoutContent` | **Completado (100%)** | `CartDrawer`, `CartView`, `OrderSummary`, `PickupBranchSelector` y `CheckoutContent` auditados con 0 violaciones. Se corrigieron `aria-allowed-role` en `CartView` (`<article role="row">` -> `<div role="row">`), `aria-required-children` en `PickupBranchSelector`, `heading-order` en `OrderSummary` (`<h3>` -> `<h2>`) y semántica modal con `role="dialog"` en `CartDrawer`. |
| **5. Autenticación** | `LoginForm`, `RegisterForm`, `ResetPasswordForm`, `LoginDropdown`, `ForgotPasswordForm` | **Completado (100%)** | `LoginForm`, `LoginDropdown`, `RegisterForm`, `ForgotPasswordForm` y `ResetPasswordForm` auditados con 0 violaciones. Se corrigieron `aria-label` en inputs compactos de `LoginDropdown`, validadas asociaciones de label/input, `aria-describedby` en errores de validación, `aria-invalid` y estados de submit. |
| **6. Perfil de Usuario** | `ProfileView`, `ProfileTabs`, `ProfileDataTab`, `OrdersTab`, `OrderDetailModal`, `AddressesTab`, `AddressForm`, `ChangePasswordForm`, `FavoritesTab`, `FavoritesList`, `FavoriteButton` | **Completado (100%)** | `ProfileView`, `ProfileDataTab`, `ChangePasswordForm`, `AddressesTab`, `AddressForm`, `OrdersTab`, `OrderDetailModal`, `FavoritesList` y `FavoriteButton` auditados con 0 violaciones. Se corrigieron `aria-allowed-role` en `ProfileTabs` (`<nav role="tablist">` -> `<div role="tablist">`), estructura de lista de definición en `ProfileDataTab` (moviendo `<h3>` fuera de `<dl>`), y `heading-order` en `AddressesTab` (`<h4>` -> `<h3>`); validados modales `role="dialog"`, tablas semánticas de órdenes y botones con `aria-pressed`. |
| **7. Panel de Administración**| `AdminLayout`, `AdminDashboardView`, `AdminCategoriesView`, `AdminCategoriesTable`, `AdminProductListView`, `AdminProductsTable`, `AdminOrdersView`, `AdminOrdersTable`, `AdminUsersListView`, `AdminUsersTable`, `ProductForm`, modales (`CategoryModalForm`, `DeleteCategoryModal`) | **Completado (100%)** | `AdminLayout`, `AdminDashboardView`, `AdminCategoriesView`, `AdminProductListView`, `AdminOrdersView`, `AdminUsersListView` y `ProductForm` auditados con 0 violaciones. Se corrigieron `dialog-name` y `landmark-no-duplicate-banner` en modales (`<header>` -> `<div>` y `aria-labelledby`), `image-redundant-alt` en thumbnails de productos con texto adyacente (`alt=""` + `aria-hidden="true"`), encabezados `scope="col"` en tablas de categorías y dashboard, y botones de expansión jerárquica con `aria-expanded` y `aria-label` descriptivos. |

---

## 4. Resumen del User Journey Roadmap y Métricas Finales

El plan de accesibilidad cubrió las 7 etapas del viaje del usuario en su totalidad:

- **Total de Suites a11y Creadas**: **32 archivos de prueba (`*.a11y.test.tsx`)**
- **Total de Pruebas Unitarias de Accesibilidad**: **56 pruebas pasando al 100%**
- **Violaciones de `axe-core` Restantes**: **0 violaciones (WCAG 2.1 AA Compliant)**
- **Errores de TypeScript**: **0 errores (`tsc --noEmit` limpio)**

---

## 5. Cómo Escribir una Prueba de Accesibilidad

Para auditar cualquier componente del proyecto, crea un archivo con la extensión `*.a11y.test.tsx` (o dentro de su suite unitaria habitual) siguiendo esta estructura:

```typescript
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { MiComponente } from './MiComponente';

describe('Accesibilidad — MiComponente', () => {
    it('cumple con las directrices de accesibilidad WCAG 2.1 AA', async () => {
        const { container } = render(
            <MemoryRouter>
                <AppProviders>
                    <MiComponente />
                </AppProviders>
            </MemoryRouter>
        );

        // Audita el árbol DOM renderizado
        const results = await axe(container);

        // Falla si axe-core encuentra violaciones de etiquetas, ARIA o estructura
        expect(results).toHaveNoViolations();
    });
});
```

### Comandos de Ejecución:
- Ejecutar todas las pruebas de accesibilidad:
  ```bash
  pnpm --dir frontend test -- "a11y"
  ```
- Ejecutar la suite completa de pruebas unitarias:
  ```bash
  pnpm --dir frontend test
  ```
