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
│   │   ├── catalog.cy.ts
│   │   └── login.cy.ts
│   ├── support/
│   │   ├── e2e.ts              # Carga commands
│   │   └── commands.ts         # cy.stubShopApi(), stubAuthApi(), …
│   └── tsconfig.json           # Tipos Cypress para el IDE
├── src/
│   ├── test/
│   │   ├── setup.ts            # jest-dom + lifecycle MSW
│   │   ├── utils/
│   │   │   └── render.tsx      # renderWithRouter()
│   │   └── msw/
│   │       ├── constants.ts    # API_BASE (= VITE_API_URL)
│   │       ├── handlers.ts     # Rutas mockeadas
│   │       ├── server.ts       # setupServer para Vitest
│   │       └── fixtures/       # Datos JSON reutilizables
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

Para tests que necesiten providers (`AuthProvider`, etc.), envolver en el test o ampliar `render.tsx` según el caso.

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
| `cy.stubAdminApi()` | GET usuarios (panel admin) | `@getAdminUsers` |
| `cy.fillLoginForm(email, password)` | Rellena formulario en `/login` | — |
| `cy.submitLoginForm()` | Envía formulario de login | — |
| `cy.fillRegisterForm(data)` | Rellena formulario en `/register` | — |
| `cy.submitRegisterForm()` | Envía formulario de registro | — |
| `cy.loginAsCustomer()` | Visita login y autentica como cliente | `@login` |
| `cy.loginAsAdmin()` | Visita login y autentica como admin | `@login` |

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
| `fixtures/orders.ts` | `mockOrdersPage()` |

Importar desde `@/test/msw/fixtures/...` en Vitest o con ruta relativa desde `cypress/support/`.

---

## Tests incluidos

### Vitest (15 tests)

| Archivo | Tipo | Qué verifica |
|---------|------|--------------|
| `features/profile/lib/profileRoutes.test.ts` | Unit | Rutas y tabs del perfil |
| `shared/ui/SoldOutBadge/SoldOutBadge.test.tsx` | Componente | Badge "Agotado" |
| `entities/user/api/authApi.test.ts` | API + MSW | Login cliente/admin, registro, email duplicado |
| `features/auth/model/useAuthLogic.test.ts` | Hook + MSW | Login, registro, logout y persistencia en `localStorage` |

### Cypress (8 tests)

| Spec | Casos |
|------|-------|
| `cypress/e2e/catalog.cy.ts` | Catálogo con productos mock |
| `cypress/e2e/auth.cy.ts` | Registro cliente, login cliente/admin, errores, cerrar sesión |

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

1. **`cypress/tsconfig.json`** — extiende el tsconfig raíz e incluye `"types": ["cypress", "node"]`.
2. **Referencia de proyecto** en `tsconfig.json` → `{ "path": "./cypress/tsconfig.json" }`.
3. **ESLint** — globals `cy`, `Cypress` y Mocha (`describe`, `it`, …) en archivos `cypress/**/*.ts`.

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
