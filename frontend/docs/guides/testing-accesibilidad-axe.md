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
| **2. Catálogo y Búsqueda** | `ProductCard`, `ProductCatalog`, `ProductFilters`, `SortSelector`, `Pagination` | *Pendiente* | Por auditar labels en botones de carrito, badges de stock y filtros facetados. |
| **3. Detalle de Producto** | `ProductDetailView`, `ProductImageSlider`, `SpecsTable`, selectores de compra | *Pendiente* | Por auditar navegación por teclado en galería y nombres accesibles. |
| **4. Carrito y Checkout** | `CartDrawer`, `PickupBranchSelector`, `AddressForm`, `CheckoutView`, `PaymentStep` | *Pendiente* | Por auditar focus-trap en modal/drawer y atributos `aria-live` en totales. |
| **5. Autenticación** | `LoginForm`, `RegisterForm`, `ResetPasswordForm`, `LoginDropdown` | *Pendiente* | Por auditar mensajes de error accesibles (`aria-describedby` y `aria-invalid`). |
| **6. Perfil de Usuario** | `ProfileView`, `OrdersHistory`, `AddressBook`, `FavoritesList` | *Pendiente* | Por auditar tablas de pedidos y botones de acción. |
| **7. Panel de Administración**| `AdminCategoriesView`, `AdminProductsView`, `AdminBranchesView`, modales | *Pendiente* | Por auditar Tree-Table, roles de tabla jerárquica y modales de confirmación. |

---

## 4. Cómo Escribir una Prueba de Accesibilidad

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
