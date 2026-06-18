# Testing — Frontend JEPLabs

Guía detallada de la estrategia de pruebas del frontend: **Vitest** + **React Testing Library** + **MSW** para unit/integration, y **Cypress** para E2E.

Para un resumen rápido, ver la sección [Testing](../README.md#testing) del README principal.

---

## Tabla de contenidos

- [Stack y responsabilidades](#stack-y-responsabilidades)
- [Scripts](#scripts)
- [Estructura de archivos](#estructura-de-archivos)
- [Tests unitarios e integración (Vitest)](#tests-unitarios-e-integración-vitest)
- [Mock de API con MSW](#mock-de-api-con-msw)
- [Tests E2E (Cypress)](#tests-e2e-cypress)
- [Fixtures compartidos](#fixtures-compartidos)
- [Tests incluidos](#tests-incluidos)
- [Evaluación de buenas prácticas](#evaluación-de-buenas-prácticas)
- [Plan propuesto de cobertura](#plan-propuesto-de-cobertura)
- [Cómo añadir tests nuevos](#cómo-añadir-tests-nuevos)
- [TypeScript en Cypress (`cy` en rojo)](#typescript-en-cypress-cy-en-rojo)
- [Troubleshooting](#troubleshooting)

---

## Stack y responsabilidades

| Herramienta | Uso | Entorno |
|-------------|-----|---------|
| [Vitest](https://vitest.dev/) | Unit tests, helpers puros, funciones de API | `jsdom` (Node) |
| [React Testing Library](https://testing-library.com/react) | Render de componentes, interacción de usuario | `jsdom` |
| [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) | Matchers (`toBeInTheDocument`, etc.) | Vitest |
| [MSW](https://mswjs.io/) | Interceptar `fetch` en tests unitarios | `msw/node` (`setupServer`) |
| [Cypress](https://www.cypress.io/) | Flujos completos en navegador real | Electron (headless o UI) |
| [start-server-and-test](https://github.com/bahmutov/start-server-and-test) | Levantar Vite antes de Cypress E2E | Shell |

**División de mocks:**

- **Vitest** → MSW (`src/test/msw/server.ts`) intercepta peticiones antes de salir del proceso Node.
- **Cypress** → `cy.intercept()` en `cypress/support/commands.ts`, reutilizando los **mismos fixtures** que MSW (`src/test/msw/fixtures/`).

Así los datos de prueba son consistentes entre capas sin duplicar JSON.

---

## Scripts

Todos los comandos usan **pnpm** (incluido E2E; no se invoca `npm run` internamente).

| Comando | Descripción |
|---------|-------------|
| `pnpm test` | Vitest — una pasada |
| `pnpm test:watch` | Vitest en modo watch |
| `pnpm test:coverage` | Vitest + cobertura (`coverage/` con reporter v8) |
| `pnpm cypress:open` | Cypress Test Runner (UI) — requiere dev server manual o `test:e2e:open` |
| `pnpm cypress:run` | Cypress headless — requiere app en `http://localhost:5173` |
| `pnpm test:e2e` | `pnpm dev` + espera al puerto 5173 + `pnpm cypress:run` |
| `pnpm test:e2e:open` | Igual que arriba pero abre la UI de Cypress |

Los scripts `test:e2e*` ejecutan explícitamente:

```text
start-server-and-test 'pnpm dev' http://localhost:5173 'pnpm cypress:run'
```

---

## Estructura de archivos

```text
frontend/
├── cypress/
│   ├── e2e/                    # Specs E2E (*.cy.ts)
│   │   ├── auth.cy.ts
│   │   └── catalog.cy.ts
│   ├── support/
│   │   ├── e2e.ts              # Carga commands
│   │   └── commands.ts         # cy.stubShopApi(), stubAuthApi(), …
│   └── tsconfig.json           # Tipos Cypress para el IDE
├── src/
│   ├── test/
│   │   ├── setup.ts            # jest-dom + lifecycle MSW
│   │   ├── utils/
│   │   │   ├── render.tsx              # renderWithRouter()
│   │   │   └── renderWithProviders.tsx # AuthProvider + MemoryRouter
│   │   └── msw/
│   │       ├── constants.ts    # API_BASE (= VITE_API_URL)
│   │       ├── handlers.ts     # Rutas mockeadas
│   │       ├── server.ts       # setupServer para Vitest
│   │       └── fixtures/       # Datos JSON reutilizables
│   │           └── auth-registry.ts  # Usuarios dinámicos registro → login
│   └── **/*.test.{ts,tsx}      # Colocados junto al código bajo prueba
├── cypress.config.ts
└── vite.config.ts              # Bloque `test` de Vitest
```

**Convención de nombres:** `*.test.ts` / `*.test.tsx` (también válido `*.spec.*`).

---

## Tests unitarios e integración (Vitest)

### Configuración

En `vite.config.ts`:

- `environment: 'jsdom'`
- `globals: true` → `describe`, `it`, `expect` sin import (tipos en `tsconfig.json`)
- `setupFiles: ['./src/test/setup.ts']`
- `env.VITE_API_URL` cargada desde `.env` vía `loadEnv` (debe coincidir con MSW)

### Setup global (`src/test/setup.ts`)

1. Importa `@testing-library/jest-dom/vitest`
2. Arranca MSW con `server.listen({ onUnhandledRequest: 'error' })` — cualquier `fetch` no mockeado **falla el test**
3. Tras cada test: `cleanup()`, `server.resetHandlers()`, `localStorage.clear()`

### Utilidad de render

`renderWithRouter()` envuelve el componente en `MemoryRouter` para tests que usan React Router:

```tsx
import { render, screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/utils/render';
import { MyComponent } from './MyComponent';

it('navega al hacer clic', () => {
    renderWithRouter(<MyComponent />, { routerProps: { initialEntries: ['/catalogo'] } });
    // …
});
```

Para tests que necesiten providers (`AuthProvider`, etc.), usar `renderWithProviders()` desde `@/test/utils/renderWithProviders` o ampliar según el caso.

---

## Mock de API con MSW

### Base URL

`src/test/msw/constants.ts` resuelve `API_BASE` desde `import.meta.env.VITE_API_URL` (misma variable que `src/shared/config/env.ts`).

> Si cambias `VITE_API_URL` en `.env`, Vitest y MSW la leen automáticamente. Los handlers deben usar `${API_BASE}/api/...`.

### Handlers (`handlers.ts`)

Rutas mockeadas actualmente:

| Método | Ruta | Respuesta |
|--------|------|-----------|
| GET | `/api/categorias` | Árbol de categorías de prueba |
| GET | `/api/productos` | Página Spring con 2 productos |
| GET | `/api/productos/slug/:slug` | Producto o 404 |
| GET | `/api/usuarios/perfil` | Perfil de usuario de prueba |
| GET | `/api/direcciones` | `[]` |
| GET | `/api/ordenes` | Página vacía |
| GET | `/api/carrito` | Carrito vacío |
| GET | `/api/productos/admin` | Productos por estado (admin) |
| POST/PATCH/DELETE | `/api/productos*` | CRUD admin de productos |
| GET/PATCH | `/api/ordenes/admin*` | Listado y estado de pedidos (admin) |
| GET/PATCH | `/api/auth/usuarios*` | Usuarios, rol y estado (admin) |
| POST | `/api/auth/register` | Usuario nuevo o 409 si email ya existe |
| POST | `/api/auth/login` | Token si credenciales válidas; 401 si no |

### Credenciales de prueba (`fixtures/auth.ts`)

| Email | Password | Rol |
|-------|----------|-----|
| `test@example.com` | `Password1!` | `ROLE_CUSTOMER` |
| `admin@example.com` | `Password1!` | `ROLE_ADMIN` |

### Override puntual en un test

```ts
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API_BASE } from '@/test/msw/constants';

it('devuelve 500', async () => {
    server.use(
        http.get(`${API_BASE}/api/productos`, () =>
            HttpResponse.json({ error: 'Fallo' }, { status: 500 })
        )
    );
    // …
});
```

---

## Tests E2E (Cypress)

### Configuración (`cypress.config.ts`)

- `baseUrl: http://localhost:5173`
- `specPattern: cypress/e2e/**/*.cy.ts`
- `allowCypressEnv: false` — no usamos `Cypress.env()`; evita exponer config al código del browser
- `video: false` (screenshots solo en fallos)

### Comandos custom (`cypress/support/commands.ts`)

| Comando | Intercepta | Alias |
|---------|------------|-------|
| `cy.stubShopApi()` | categorías, productos, producto por slug | `@getCategories`, `@getProducts`, … |
| `cy.stubAuthApi()` | POST login y registro | `@login`, `@register` |
| `cy.stubAuthenticatedApi()` | perfil, direcciones, órdenes, carrito | `@getProfile`, … |
| `cy.stubAdminApi()` | productos admin, usuarios, órdenes admin | `@getAdminProducts`, `@getAdminOrders`, `@getAdminUsers`, … |
| `cy.fillLoginForm(email, password)` | Rellena formulario en `/login` | — |
| `cy.submitLoginForm()` | Envía formulario de login | — |
| `cy.fillRegisterForm(data)` | Rellena formulario en `/register` | — |
| `cy.submitRegisterForm()` | Envía formulario de registro | — |
| `cy.loginAsCustomer()` | Visita login y autentica como cliente | `@login` |
| `cy.loginAsAdmin()` | Visita login y autentica como admin | `@login` |
| `cy.registerCustomer(data)` | Registro completo en `/register` | `@register` |

Los usuarios creados en registro E2E quedan en **`auth-registry`** (memoria) y pueden hacer login inmediatamente después, igual que en Vitest/MSW.

Ejemplo típico en un spec de ruta autenticada:

```ts
beforeEach(() => {
    cy.clearLocalStorage();
    cy.stubShopApi();
    cy.stubAuthApi();
    cy.stubAuthenticatedApi();
});
```

### Notas de selectores (login)

La página `/login` comparte viewport con el **navbar sticky** (buscador encima). Los specs de login:

- Scopean el formulario con `cy.contains('h1', 'Iniciar sesión').parent().within(...)`
- Usan `{ force: true }` en `type`/`click` cuando el layout tapa el input

Esto evita falsos negativos por superposición de capas, no indica un bug de la app.

---

## Fixtures compartidos

| Archivo | Contenido |
|---------|-----------|
| `fixtures/products.ts` | `mockProduct`, `mockSoldOutProduct`, `mockProductsPage()` |
| `fixtures/auth.ts` | Tokens JWT fake, perfil, credenciales |
| `fixtures/categories.ts` | Árbol mínimo de categorías |
| `fixtures/cart.ts` | `mockEmptyCart` |
| `fixtures/orders.ts` | `mockOrdersPage()`, `mockCreatedOrder()` |
| `fixtures/products-registry.ts` | Catálogo stateful + CRUD admin |
| `fixtures/users-registry.ts` | Usuarios admin stateful |

Importar desde `@/test/msw/fixtures/...` en Vitest o con ruta relativa desde `cypress/support/`.

---

## Tests incluidos

### Vitest (97 tests)

| Archivo | Tipo | Qué verifica |
|---------|------|--------------|
| `features/profile/lib/profileRoutes.test.ts` | Unit | Rutas y tabs del perfil |
| `shared/ui/SoldOutBadge/SoldOutBadge.test.tsx` | Componente | Badge "Agotado" |
| `entities/user/api/authApi.test.ts` | API + MSW | Login, registro, email duplicado, registro → login |
| `entities/user/api/profileApi.test.ts` | API + MSW | get/update perfil, cambio contraseña |
| `features/auth/model/useAuthLogic.test.ts` | Hook + MSW | Login, registro, registro → login, logout |
| `app/router/PrivateRoute.test.tsx` | Componente + providers | Redirección por rol y sesión |
| `features/catalog/lib/filter-facets.test.ts` | Unit | Facetas, filtros por precio/marca/búsqueda |
| `features/catalog/lib/catalog-query-params.test.ts` | Unit | Parse/build de URL (`?search=`, filtros, sort) |
| `features/catalog/lib/sort-catalog-products.test.ts` | Unit | Orden por precio y nombre |
| `features/catalog/lib/category-path.test.ts` | Unit | Resolución de paths de categoría |
| `entities/product/api/productApi.test.ts` | API + MSW | `getAll`, `getBySlug`, `getByCategory`, 404 |
| `shared/ui/Card/ProductCard.test.tsx` | Componente | Stock agotado, agregar al carrito |
| `widgets/product-detail/ProductInfo/ProductInfo.test.tsx` | Componente | SKU, stock disponible / sin stock |
| `entities/cart/api/cartApi.test.ts` | API + MSW | add, update qty, remove, clear |
| `entities/cart/model/useCartLogic.test.tsx` | Hook + MSW | Total, logout, errores API |
| `entities/shipping/api/shippingApi.test.ts` | API + MSW | Opciones de envío, envío gratis |
| `features/checkout/lib/bank-transfer-accounts.test.ts` | Unit | Cuentas demo bancarias |
| `features/checkout/lib/transfer-order-storage.test.ts` | Unit | Marca transferencia, comprobante local |
| `features/checkout/model/useCheckoutLogic.test.tsx` | Hook + MSW | Pasos, dirección, pago, crear orden |
| `entities/address/api/addressApi.test.ts` | API + MSW | CRUD direcciones, marcar principal |
| `entities/order/model/useOrdenesLogic.test.tsx` | Hook + MSW | Lista, detalle cache, cancelar |
| `features/favorites/lib/favorites-storage.test.ts` | Unit | Favoritos por JWT `sub`, add/remove |
| `features/favorites/model/useFavoritesLogic.test.tsx` | Hook | Toggle, persistencia, auth |
| `entities/product/api/productApi.admin.test.ts` | API + MSW | CRUD admin, imágenes, estado |
| `entities/user/api/authApi.admin.test.ts` | API + MSW | listUsuarios, rol, activar/desactivar |
| `features/admin/model/useAdminOrdersLogic.test.tsx` | Hook + MSW | Lista admin, filtro, cambio estado |

### Cypress (28 tests)

| Spec | Casos |
|------|-------|
| `cypress/e2e/auth.cy.ts` | Registro, registro → login, login cliente/admin, ruta protegida, logout |
| `cypress/e2e/catalog.cy.ts` | Listado, búsqueda `?search=`, orden `?sort=`, filtro `?precioMax=` |
| `cypress/e2e/category.cy.ts` | Subcategoría Audio con productos filtrados |
| `cypress/e2e/product.cy.ts` | Detalle desde catálogo; producto agotado sin añadir |
| `cypress/e2e/cart.cy.ts` | Agregar, cambiar cantidad, eliminar ítem |
| `cypress/e2e/checkout.cy.ts` | Checkout con transferencia bancaria → success |
| `cypress/e2e/checkout-guest.cy.ts` | Redirige a login al agregar o visitar `/cart` |
| `cypress/e2e/profile.cy.ts` | Tabs datos, direcciones, pedidos, favoritos |
| `cypress/e2e/profile-orders.cy.ts` | Detalle, cancelar pedido, comprobante transferencia |
| `cypress/e2e/favorites.cy.ts` | Corazón en producto → tab favoritos → quitar |
| `cypress/e2e/admin-products.cy.ts` | Login admin → listar → crear producto |
| `cypress/e2e/admin-orders.cy.ts` | Ver pedidos → filtrar → cambiar estado |
| `cypress/e2e/admin-users.cy.ts` | Listar usuarios → editar rol |

---

## Evaluación de buenas prácticas

Los tests actuales **sí siguen buenas prácticas en lo esencial** y son **efectivos como base**: cubren capas distintas (helper puro, componente, API, hook, E2E), fallan ante regresiones reales y no dependen del backend en ejecución local.

### Lo que está bien hecho

| Práctica | Dónde se aplica | Por qué importa |
|----------|-----------------|-----------------|
| **Pirámide de tests** | Vitest (rápidos) + Cypress (flujos críticos) | Feedback rápido en CI y confianza en journeys reales |
| **Tests colocalizados** | `*.test.ts(x)` junto al código | Fácil de encontrar y mantener al cambiar un módulo |
| **MSW estricto** | `onUnhandledRequest: 'error'` en `setup.ts` | Obliga a mockear toda llamada HTTP; evita tests que “pasan por suerte” |
| **Fixtures compartidos** | `src/test/msw/fixtures/` + Cypress commands | Mismos datos en unit y E2E; un solo lugar para actualizar |
| **Probar comportamiento, no implementación** | E2E: URLs, títulos, mensajes de error; unit: contratos de API | Un refactor interno no rompe tests si la UX sigue igual |
| **Queries orientadas al usuario** | Cypress: `contains('h1', …)`, `button`, `input[name=…]` | Alineado con [Testing Library](https://testing-library.com/docs/quirks/about/#guiding-principles) y Cypress best practices |
| **Comandos reutilizables** | `cy.loginAsCustomer()`, `cy.stubShopApi()`, … | Menos duplicación; specs legibles |
| **Aislamiento entre tests** | `localStorage.clear()`, `server.resetHandlers()`, `cleanup()` | Sin estado residual entre casos |
| **Tests de helpers puros** | `profileRoutes.test.ts` | Máximo valor/esfuerzo; muy estables |
| **Tests en el borde HTTP** | `authApi.test.ts` + MSW | Valida parseo Zod, status codes y mensajes de error |

### Limitaciones actuales (aceptables por ahora, mejorables)

| Aspecto | Situación | Recomendación |
|---------|-----------|---------------|
| **`{ force: true }` en Cypress** | Necesario por navbar sticky / `body { position: fixed }` | Aceptable documentado; a medio plazo considerar `data-testid` solo en formularios de auth o ajustar z-index en CSS de test |
| **Clase CSS en SoldOutBadge** | Se asserta `placementStart` en className | Preferible `data-placement` o comprobar posición visual solo en E2E |
| **Sin `renderWithProviders`** | *(Resuelto en Fase 0)* | Usar `@/test/utils/renderWithProviders` para rutas con `AuthProvider` |
| **Sin `getByRole` en RTL** | SoldOutBadge usa `getByText`; PrivateRoute usa roles | Ir extendiendo roles en componentes nuevos |
| **E2E no encadenaban registro → login** | *(Resuelto en Fase 0)* | `auth-registry` + spec dedicado |
| **Cobertura no exigida en CI** | Solo script manual `test:coverage` | Fijar umbral mínimo (p. ej. 60 %) cuando el plan avance |
| **Vitest en Windows** | A veces timeout con pool `forks` | Si falla intermitente: `pnpm exec vitest run --pool=threads` |
| **Handlers duplicados** | MSW (Node) y `cy.intercept` (browser) | Trade-off razonable; mantener fixtures como única fuente de verdad |

### Veredicto

| Pregunta | Respuesta |
|----------|-----------|
| ¿Buenas prácticas? | **Sí**, en arquitectura y enfoque general |
| ¿Efectivos? | **Sí** para auth, catálogo, checkout, perfil y **admin** (productos, pedidos, usuarios); pendiente Fase 5–6 |
| ¿Production-grade al 100 %? | **Todavía no** — falta volumen y algún refinamiento (providers, selectores, CI) |

No hay anti-patrones graves (no se testean detalles privados de React, no hay sleeps arbitrarios, no hay dependencia del backend real). Lo pendiente es **ampliar cobertura** siguiendo el mismo estilo.

---

## Plan propuesto de cobertura

Roadmap sugerido por **prioridad de negocio** y **retorno de inversión**. Marca `[x]` lo ya hecho.

**Leyenda de capas**

- **U** = Vitest unitario (helpers, mappers, schemas)
- **I** = Vitest integración (API + MSW, hooks con `renderHook`)
- **C** = RTL componente (UI aislada o con providers)
- **E** = Cypress E2E (flujo en navegador)

### Fase 0 — Infraestructura ✅ cerrada

- [x] Vitest + RTL + MSW + Cypress configurados
- [x] Fixtures y commands compartidos (+ `auth-registry` para registro → login)
- [x] Auth: registro, login cliente/admin, logout (U/I + E)
- [x] Auth: registro → login mismo usuario (U/I + E)
- [x] Auth: ruta protegida sin sesión (E) y `PrivateRoute` (C)
- [x] `renderWithProviders()` para tests con contexto
- [x] Catálogo: listado básico (E)
- [x] Helpers de perfil: rutas (U)
- [x] Componente SoldOutBadge (C)
- [x] Vitest estable en Windows (`--pool=threads`)

### Fase 1 — Catálogo y producto ✅ cerrada

Objetivo: búsqueda, filtros y detalle de producto sin regresiones.

- [x] Helpers de catálogo: `filter-facets`, `catalog-query-params`, `sort-catalog-products`, `category-path` (U)
- [x] `productApi`: `getAll`, `getBySlug`, `getByCategory`, 404 (I)
- [x] `ProductCard` y `ProductInfo` (C)
- [x] Fixtures ampliados: precios, marcas, categorías Audio (MSW + Cypress)
- [x] E2E: `catalog.cy.ts` (búsqueda, orden, precio máx.)
- [x] E2E: `product.cy.ts` (detalle, agotado)
- [x] E2E: `category.cy.ts` (subcategoría Audio)
- [x] `renderWithShopProviders()` para componentes con router + providers

| Área | Tests sugeridos | Capas |
|------|-----------------|-------|
| `features/catalog/lib/filter-facets.ts` | `applyProductFilters`, `extractFilterFacets`, defaults | U |
| `features/catalog/lib/catalog-query-params.ts` | Parse/build de URL (`?search=`, filtros, sort) | U |
| `features/catalog/lib/sort-catalog-products.ts` | Orden por precio, nombre | U |
| `features/catalog/lib/category-path.ts` | Construcción de paths de categoría | U |
| `entities/product/api/productApi.ts` | `getAll`, `getBySlug`, errores 404 | I |
| `shared/ui/Card/ProductCard.tsx` | Botón deshabilitado si `stock <= 0`, badge agotado | C |
| `widgets/product-detail/ProductInfo/ProductInfo.tsx` | Stock disponible / sin stock, pills SKU | C |
| **E2E** `product.cy.ts` | Ver detalle desde catálogo; producto agotado no permite agregar | E |
| **E2E** `catalog.cy.ts` (ampliar) | Filtro por URL; búsqueda `?search=`; ordenación | E |
| **E2E** `category.cy.ts` | Navegar categoría → productos filtrados | E |

**Fixtures MSW/Cypress:** productos con distintas categorías, precios y estados (`mockCatalogProducts`, `mockProductAlpha`, `mockProductBeta`).

### Fase 2 — Carrito y checkout ✅ cerrada

Objetivo: flujo de compra completo (core del ecommerce).

- [x] `cartApi`: add, update qty, remove, clear (I)
- [x] `useCartLogic`: total, vaciar al logout, errores API (I)
- [x] `shippingApi`: opciones de envío (I)
- [x] `useCheckoutLogic`: pasos, dirección, envío, pago, crear orden (I)
- [x] `bank-transfer-accounts`, `transfer-order-storage` (U)
- [x] Fixtures: `cart-registry`, `addresses`, `shipping`, `mockCreatedOrder`
- [x] MSW/Cypress: carrito stateful, envío, direcciones, `POST /api/ordenes`
- [x] Comando Cypress `addProductToCart()`
- [x] E2E: `cart.cy.ts`, `checkout.cy.ts`, `checkout-guest.cy.ts`

| Área | Tests sugeridos | Capas |
|------|-----------------|-------|
| `entities/cart/api/cartApi.ts` | add, update qty, remove, clear | I |
| `entities/cart/model/useCartLogic.ts` | Suma total, vaciar al logout, errores API | I |
| `entities/shipping/api/shippingApi.ts` | Opciones de envío | I |
| `features/checkout/model/useCheckoutLogic.ts` | Validación de pasos, dirección, envío | I |
| `features/checkout/lib/bank-transfer-accounts.ts` | Cuentas válidas por país/moneda | U |
| `features/checkout/lib/transfer-order-storage.ts` | Persistencia de comprobante local | U |
| **E2E** `cart.cy.ts` | Login → agregar producto → ver carrito → cambiar cantidad → quitar | E |
| **E2E** `checkout.cy.ts` | Checkout con tarjeta simulada / transferencia → success | E |
| **E2E** `checkout-guest.cy.ts` | Redirige a login si no autenticado al agregar | E |

**Fixtures:** `cart-registry.ts`, `addresses.ts`, `shipping.ts`, `mockCreatedOrder()` en `orders.ts`.

### Fase 3 — Perfil de cliente ✅ cerrada

Objetivo: datos personales, direcciones, pedidos y favoritos sin regresiones.

- [x] `profileApi`: get/update perfil, cambio contraseña (I)
- [x] `addressApi`: CRUD direcciones, marcar principal (I)
- [x] `useOrdenesLogic`: lista, detalle cache, cancelar (I)
- [x] `favorites-storage`: por JWT `sub`, add/remove (U)
- [x] `useFavoritesLogic`: toggle, persistencia (I)
- [x] `profileRoutes` *(ya cubierto)* (U)
- [x] Fixtures: `profile-registry`, `address-registry`, `orders-registry` (pedidos de muestra)
- [x] Token mock con JWT `sub` para favoritos por usuario
- [x] E2E: `profile.cy.ts`, `profile-orders.cy.ts`, `favorites.cy.ts`

| Área | Tests sugeridos | Capas |
|------|-----------------|-------|
| `entities/user/api/profileApi.ts` | get/update perfil, cambio contraseña | I |
| `entities/address/api/addressApi.ts` | CRUD direcciones, marcar principal | I |
| `entities/order/model/useOrdenesLogic.ts` | Lista, detalle desde cache, cancelar | I |
| `features/favorites/lib/favorites-storage.ts` | Por usuario JWT `sub`, add/remove | U |
| `features/favorites/model/useFavoritesLogic.ts` | Toggle, persistencia | I |
| `features/profile/lib/profileRoutes.ts` | *(ya cubierto)* | U |
| **E2E** `profile.cy.ts` | Tabs datos / direcciones / pedidos / favoritos | E |
| **E2E** `profile-orders.cy.ts` | Lista → detalle de pedido; transferencia + comprobante si aplica | E |
| **E2E** `favorites.cy.ts` | Corazón en producto → tab favoritos → quitar | E |

**Fixtures:** `profile-registry.ts`, `address-registry.ts`, `orders-registry.ts` (pedidos #501–503 con estados variados).

### Fase 4 — Admin ✅ cerrada

Objetivo: panel admin sin regresiones en productos, pedidos y usuarios.

- [x] `productApi` admin: CRUD, imágenes, estado (I)
- [x] `authApi` admin: listUsuarios, rol, activar/desactivar (I)
- [x] `useAdminOrdersLogic`: filtro por estado, cambio estado (I)
- [x] Fixtures: `products-registry`, `users-registry`; órdenes admin en `orders-registry`
- [x] MSW/Cypress: productos admin, usuarios, órdenes admin
- [x] `stubAdminApi` ampliado (productos, pedidos, usuarios)
- [x] E2E: `admin-products.cy.ts`, `admin-orders.cy.ts`, `admin-users.cy.ts`

| Área | Tests sugeridos | Capas |
|------|-----------------|-------|
| `entities/product/api/productApi.ts` | CRUD admin, imágenes, estado | I |
| `entities/user/api/authApi.ts` | listUsuarios, cambio rol/estado (admin) | I |
| `features/admin/model/useAdminOrdersLogic.ts` | Filtro por estado, cambio estado | I |
| **E2E** `admin-products.cy.ts` | Login admin → listar → crear producto | E |
| **E2E** `admin-orders.cy.ts` | Ver pedidos → cambiar estado | E |
| **E2E** `admin-users.cy.ts` | Listar usuarios → editar rol | E |

**Fixtures:** `products-registry.ts`, `users-registry.ts`; funciones admin en `orders-registry.ts`.

### Fase 5 — Auth avanzada y sesión (prioridad media)

| Área | Tests sugeridos | Capas |
|------|-----------------|-------|
| `app/router/PrivateRoute.tsx` | Redirige a login; bloquea rol incorrecto | C |
| `features/auth` | Forgot / reset password (si se usa en prod) | I + E |
| `shared/lib/jwt-expiry.ts` | Expiración de token | U |
| `features/auth/ui/SessionExpiryWarning.tsx` | Aviso antes de expirar | C |
| ~~**E2E** `auth.cy.ts` (ampliar)~~ | ~~Registro → login; ruta protegida~~ | *(Fase 0)* |

### Fase 6 — UI compartida y regresiones (prioridad baja, continua)

| Área | Tests sugeridos | Capas |
|------|-----------------|-------|
| `shared/lib/format*.ts`, `zod-helpers` | Formato moneda, fechas | U |
| `shared/ui/Button`, `FormField`, `Input` | Variantes, errores, disabled | C |
| `widgets/layout/Navbar` | Contador carrito, menú auth logueado/no logueado | C + E smoke |
| **E2E smoke** `navigation.cy.ts` | Home, footer links, breadcrumbs catálogo | E |

### Orden de implementación recomendado

```text
Fase 0 ✅  →  Fase 1 ✅  →  Fase 2 ✅  →  Fase 3 ✅  →  Fase 4 ✅ (admin)
                    ↓
              Fase 5 (sesión) en paralelo si hay bugs de auth
                    ↓
              Fase 6 (UI shared, continuo)
```

### Criterios para elegir capa

| Si… | Preferir |
|-----|----------|
| Función pura sin React ni fetch | **U** — Vitest directo |
| `*Api.ts` o hook con fetch | **I** — MSW + `renderHook` |
| Render condicional, props, accesibilidad | **C** — RTL |
| Varias pantallas, routing, localStorage, navbar | **E** — Cypress (pocos casos, happy path + 1 error) |

**Regla práctica:** por cada feature nueva, mínimo **1 test U o I** + **1 E2E del happy path** si es flujo de usuario crítico.

### Meta de cobertura sugerida (cuando el plan avance)

| Capa | Objetivo orientativo |
|------|----------------------|
| `features/*/lib`, `entities/*/model` (helpers) | 80 %+ |
| `entities/*/api` | Caso feliz + error por endpoint público |
| Componentes `shared/ui` | Solo los reutilizados y con lógica |
| E2E | 10–15 specs cubriendo journeys críticos (no duplicar todo en Cypress) |

Ejecutar periódicamente: `pnpm test:coverage` y revisar gaps en checkout, cart y profile.

---

## Cómo añadir tests nuevos

### Unit / helper puro

1. Crear `miModulo.test.ts` junto al archivo.
2. No hace falta MSW si no hay `fetch`.

### Componente React

1. Crear `Component.test.tsx` junto al componente.
2. `render()` o `renderWithRouter()` según necesite rutas.
3. Si el componente hace fetch al montar, añadir handler en `handlers.ts` o `server.use()` en el test.

### Función de API (`entities/*/api`)

1. Crear `*Api.test.ts` junto al módulo API.
2. MSW global ya intercepta; usar fixtures existentes o ampliar handlers.

### Flujo E2E

1. Añadir `cypress/e2e/mi-flujo.cy.ts`.
2. Reutilizar `cy.stubShopApi()` / `stubAuthApi()` / `stubAuthenticatedApi()`.
3. Si el flujo llama endpoints nuevos, extender fixtures + handlers MSW + commands Cypress en el mismo PR.

---

## TypeScript en Cypress (`cy` en rojo)

**No es normal** que `cy`, `Cypress`, `describe` o `it` aparezcan en rojo de forma permanente. Suele deberse a que el IDE no aplica el `tsconfig` de Cypress.

### Qué hicimos en el repo

1. **`cypress/tsconfig.json`** — incluye `"types": ["cypress", "node"]` para specs y support.
2. **ESLint** — globals `cy`, `Cypress` y Mocha (`describe`, `it`, …) en archivos `cypress/**/*.ts`.

Cypress detecta automáticamente `cypress/tsconfig.json` para type-check de specs y support.

### Si el IDE sigue marcando errores

1. Recargar la ventana del editor (Command Palette → *Developer: Reload Window*).
2. Abrir un archivo dentro de `cypress/e2e/` y comprobar en la barra de estado qué `tsconfig` usa el IDE (debe ser `cypress/tsconfig.json`).
3. Ejecutar `pnpm exec tsc -p cypress/tsconfig.json --noEmit` — si pasa, el problema es solo del language service del IDE.

Los archivos bajo `src/**/*.test.ts` usan tipos de **Vitest** (`tsconfig.json` principal), no los de Cypress. Eso es correcto: cada carpeta tiene su contexto de tipos.

---

## Troubleshooting

| Problema | Causa probable | Solución |
|----------|----------------|----------|
| Vitest: `Unhandled request` | Falta handler MSW | Añadir ruta en `handlers.ts` o `server.use()` |
| Vitest: schema Zod falla | Fixture no alineada al backend | Ajustar fixture según `*ApiSchema` |
| E2E: `cy.wait('@login')` timeout | Intercept no registrado o formulario no enviado | Verificar `stubAuthApi()` y selectores del login |
| E2E: inputs no clicables | Navbar sticky / `body { position: fixed }` | Scopear formulario; `{ force: true }` si aplica |
| E2E usa `npm run` | Script antiguo de `start-server-and-test` | Usar scripts `test:e2e` actuales (con `pnpm dev`) |
| MSW / app URL distinta | `.env` con otro puerto | Unificar `VITE_API_URL`; Vitest la carga vía `loadEnv` |
| Vitest en Windows (timeout workers) | Pool `forks` lento o colgado | `pnpm exec vitest run --pool=threads --maxWorkers=1` |
| Cypress binary missing | `approve-builds` de pnpm | `pnpm exec cypress install` |

### Artefactos ignorados por git

- `coverage/`
- `cypress/screenshots/`
- `cypress/videos/`

---

## Referencias

- [Vitest — Config](https://vitest.dev/config/)
- [MSW — Node integration](https://mswjs.io/docs/integrations/node)
- [Cypress — Best practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing Library — Guiding Principles](https://testing-library.com/docs/guiding-principles)
