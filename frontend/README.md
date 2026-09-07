# JEPLabs Ecommerce — Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![React Router](https://img.shields.io/badge/React%20Router-7-CA4245?logo=reactrouter&logoColor=white&style=for-the-badge)
![Zod](https://img.shields.io/badge/Zod-4-3E67B1?logo=zod&logoColor=white&style=for-the-badge)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-7-EC5990?logo=reacthookform&logoColor=white&style=for-the-badge)

![Vitest](https://img.shields.io/badge/Tests-Vitest%204-6E9F18?logo=vitest&logoColor=white&style=for-the-badge)
![Testing Library](https://img.shields.io/badge/Testing%20Library-E33332?logo=testinglibrary&logoColor=white&style=for-the-badge)
![MSW](https://img.shields.io/badge/MSW%202-FF6A33?logo=msw&logoColor=white&style=for-the-badge)
![Cypress](https://img.shields.io/badge/Cypress%2015-17202C?logo=cypress&logoColor=white&style=for-the-badge)
![ESLint](https://img.shields.io/badge/ESLint%209-4B32C3?logo=eslint&logoColor=white&style=for-the-badge)
![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white&style=for-the-badge)

SPA de comercio electrónico construida con **React 19**, **TypeScript**, **Vite 7** y **Feature-Sliced Design (FSD)**. Consume la API REST del backend Spring Boot y prioriza tipado estricto, estilos encapsulados con CSS Modules y una estructura de carpetas predecible para equipos.

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [Inicio rápido](#inicio-rápido)
- [Scripts disponibles](#scripts-disponibles)
- [Variables de entorno](#variables-de-entorno)
- [Arquitectura FSD](#arquitectura-fsd)
- [Estructura de directorios](#estructura-de-directorios)
- [Reglas de dependencia](#reglas-de-dependencia)
- [Convenciones de nombres](#convenciones-de-nombres)
- [Estilos y CSS Modules](#estilos-y-css-modules)
- [Datos, validación y formularios](#datos-validación-y-formularios)
- [Routing y layouts](#routing-y-layouts)
- [API pública (barrels)](#api-pública-barrels)
- [Buenas prácticas de desarrollo](#buenas-prácticas-de-desarrollo)
- [Build y despliegue](#build-y-despliegue)
- [Testing](#testing)
- [Documentación relacionada](#documentación-relacionada)

---

## Stack tecnológico

| Área | Tecnología |
|------|------------|
| Runtime / bundler | [Vite 7](https://vite.dev/) |
| UI | [React 19](https://react.dev/) + [React Router 7](https://reactrouter.com/) |
| Lenguaje | [TypeScript 6](https://www.typescriptlang.org/) (strict mode) |
| Validación | [Zod 4](https://zod.dev/) |
| Formularios | [React Hook Form 7](https://react-hook-form.com/) + `@hookform/resolvers` |
| Estilos | CSS Modules + design tokens globales |
| Utilidades UI | [clsx](https://github.com/lukeed/clsx) |
| Lint | ESLint 9 + typescript-eslint + React Hooks (flat config en `eslint.config.ts`) |
| Tests unitarios | [Vitest 4](https://vitest.dev/) + [Testing Library](https://testing-library.com/react) + [MSW 2](https://mswjs.io/) |
| Tests E2E | [Cypress 15](https://www.cypress.io/) |
| Gestor de paquetes | [pnpm](https://pnpm.io/) |

---

## Requisitos

- **Node.js** 18 LTS o superior (recomendado 20+)
- **pnpm** 9+ (instalación detallada en [docs/pnpm.md](./docs/pnpm.md))
- Backend Spring Boot en ejecución (por defecto `http://localhost:8080`)

---

## Inicio rápido

```bash
# Desde la raíz del monorepo o directamente en frontend/
cd frontend

# Instalar dependencias (genera/usa pnpm-lock.yaml)
pnpm install

# Servidor de desarrollo → http://localhost:5173
pnpm run dev
```

> **Instalación de pnpm, migración desde npm, approve-builds y troubleshooting:**  
> consulta **[docs/pnpm.md](./docs/pnpm.md)**.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm run dev` | Servidor de desarrollo con HMR (puerto 5173) |
| `pnpm run build` | Build de producción en `dist/` |
| `pnpm run preview` | Sirve el build local para pruebas |
| `pnpm run lint` | ESLint sobre `**/*.{ts,tsx}` (typescript-eslint + React Hooks) |
| `pnpm test` | Vitest — tests unitarios e integración (una pasada) |
| `pnpm test:watch` | Vitest en modo watch |
| `pnpm test:coverage` | Vitest con reporte de cobertura |
| `pnpm test:e2e` | Cypress headless (levanta `pnpm dev` automáticamente) |
| `pnpm test:e2e:open` | Cypress con UI interactiva + dev server |
| `pnpm cypress:open` | Abre Cypress (servidor de dev debe estar corriendo) |
| `pnpm cypress:run` | Cypress headless (servidor de dev debe estar corriendo) |

Detalle completo en **[docs/testing.md](./docs/testing.md)**.

---

## Variables de entorno

Vite expone variables con prefijo `VITE_`. Crear un `.env.local` en `frontend/` si necesitas sobrescribir valores:

```env
# URL base del backend Spring Boot
VITE_API_URL=http://localhost:8080
```

Valor por defecto definido en `src/shared/config/env.ts`:

```ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
```

---

## Arquitectura FSD

El código sigue **[Feature-Sliced Design](https://feature-sliced.design/)**: capas con responsabilidades claras y dependencias unidireccionales (de arriba hacia abajo).

```
                    ┌─────────────┐
                    │     app     │  Bootstrap, router, providers, estilos globales
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    pages    │  Una composición por ruta (thin pages)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   widgets   │  Bloques de UI compuestos (Navbar, CatalogView…)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  features   │  Acciones de usuario (auth, checkout, admin…)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  entities   │  Modelo de dominio + contratos API
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   shared    │  UI kit, utilidades, config (sin dominio)
                    └─────────────┘
```

**Principios clave:**

- Cada **slice** (p. ej. `entities/product`, `features/checkout`) expone solo su API pública vía `index.ts`.
- Las **pages** son delgadas: leen parámetros de ruta, montan providers de página y delegan el markup a **widgets**.
- Los **widgets** no usan `useParams` ni `useLocation`; reciben datos por props.
- El **shell** (Navbar, Footer, nav de categorías) vive en **layouts** dentro de `widgets/layout/`, no se repite en cada page.

Documentación de migración y mapeo legacy → FSD: **[docs/architecture-fsd.md](./docs/architecture-fsd.md)**.

---

## Estructura de directorios

```
frontend/
├── public/                 # Assets estáticos (favicon, imágenes públicas)
├── src/
│   ├── app/                # Capa de aplicación
│   │   ├── providers/      # Contextos globales y de ruta (Auth, Cart, Checkout…)
│   │   ├── router/         # AppRouter, PrivateRoute, ScrollToTop
│   │   └── styles/         # CSS global (tokens, reset, utilities)
│   │
│   ├── pages/              # Slices por ruta
│   │   ├── home/
│   │   │   ├── ui/HomePage.tsx
│   │   │   └── index.ts
│   │   ├── catalog/
│   │   ├── checkout/
│   │   ├── admin/
│   │   └── …
│   │
│   ├── widgets/            # Composiciones de página
│   │   ├── layout/         # ShopLayout, AdminLayout, Navbar, Footer…
│   │   ├── catalog/        # CatalogView, CategoryProductsView
│   │   ├── checkout/       # CheckoutView, CheckoutSuccessView
│   │   ├── product-detail/
│   │   ├── cart/
│   │   ├── profile/
│   │   ├── admin/
│   │   └── home/
│   │
│   ├── features/           # Casos de uso / acciones de usuario
│   │   ├── auth/           # model/, ui/
│   │   ├── catalog/
│   │   ├── checkout/       # api/, lib/, model/, ui/
│   │   ├── profile/
│   │   ├── favorites/      # api/, model/ (consume /api/favoritos)
│   │   ├── admin/
│   │   └── order/
│   │
│   ├── entities/           # Dominio alineado con el backend Spring
│   │   ├── product/        # api/, model/ (schemas, types, mappers, hooks)
│   │   ├── user/
│   │   ├── order/
│   │   ├── cart/
│   │   ├── category/
│   │   ├── address/
│   │   └── shipping/
│   │
│   ├── shared/             # Código reutilizable sin lógica de negocio
│   │   ├── ui/             # Design system (Button, Input, FormField, Select…)
│   │   ├── lib/            # format, http-session, jwt-expiry…
│   │   ├── config/         # env.ts
│   │   └── api/            # Helpers HTTP compartidos
│   │
│   ├── test/               # Infraestructura de tests (MSW, setup, utils)
│   ├── assets/             # Imágenes importadas por componentes
│   ├── App.tsx             # AppProviders + AppRouter
│   └── main.tsx            # Punto de entrada React
│
├── docs/                   # Documentación detallada (ver docs/README.md)
│   ├── architecture-fsd.md
│   ├── pnpm.md
│   └── testing.md
│
├── cypress/                # Tests E2E (Cypress)
│   ├── e2e/
│   └── support/
│
├── index.html
├── vite.config.ts
├── eslint.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── README.md               # Este archivo
```

### Segmentos típicos de un slice

```
entities/product/
├── index.ts              # API pública del slice
├── api/
│   ├── index.ts
│   └── productApi.ts     # Llamadas HTTP
└── model/
    ├── schemas/
    │   ├── api.ts        # Zod: respuestas del backend
    │   └── forms.ts      # Zod: valores de formulario → DTO
    ├── types.ts
    ├── mappers.ts
    └── useProducts.ts    # Hook de dominio
```

```
features/checkout/
├── index.ts
├── api/paymentApi.ts
├── model/                # useCheckoutLogic, schemas de pago
├── lib/                  # Helpers del feature
└── ui/                   # Pasos, formularios simulados, resumen…
```

### Fallback de carga lazy (`LazyRouteFallback`)

Para las rutas code-split, `AppRouter` usa `<Suspense fallback={<LazyRouteFallback />}>`. El componente `LazyRouteFallback` (`src/app/router/LazyRouteFallback.tsx`) muestra un spinner accesible (`role="status"`) que respeta `prefers-reduced-motion`. Se monta durante la descarga del chunk de la página destino.

---

## Reglas de dependencia

| Capa | Puede importar de |
|------|-------------------|
| `app` | pages, widgets, features, entities, shared |
| `pages` | widgets, features, entities, shared |
| `widgets` | features, entities, shared |
| `features` | entities, shared |
| `entities` | shared, otras entities (con cuidado) |
| `shared` | **solo** shared |

**Prohibido:** importar hacia arriba (p. ej. `entities` → `features`, `shared` → `entities`).

### Path aliases

Configurados en `tsconfig.json` y `vite.config.js`:

| Alias | Resuelve a |
|-------|------------|
| `@/*` | `src/*` |
| `@/entities/*` | `src/entities/*` |
| `@/features/*` | `src/features/*` |
| `@/widgets/*` | `src/widgets/*` |
| `@/shared/*` | `src/shared/*` |
| `@/app/*` | `src/app/*` |

```ts
import { productApi, type ProductApi } from '@/entities/product';
import { useCheckoutLogic } from '@/features/checkout';
import { Button } from '@/shared/ui/Button';
import { useAuth } from '@/app/providers';
```

Importar siempre desde el **barrel** (`index.ts`) del slice, no desde rutas internas profundas de otro módulo.

---

## Convenciones de nombres

### Archivos y carpetas

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Componentes React | PascalCase | `ProductInfo.tsx` |
| Hooks | camelCase con prefijo `use` | `useCheckoutLogic.ts` |
| Utilidades / libs | kebab-case o camelCase | `catalog-query-params.ts` |
| Estilos de componente | `Component.module.css` | `Button.module.css` |
| Barrel público | `index.ts` | `entities/product/index.ts` |
| Pages | `*Page.tsx` en `pages/<ruta>/ui/` | `HomePage.tsx` |
| Widgets de vista | `*View.tsx` o nombre descriptivo | `CatalogView.tsx` |

### TypeScript

- Tipos de API: sufijo `Api` → `ProductApi`, `OrderApi`
- Esquemas Zod: sufijo `Schema` → `productApiSchema`
- Valores de formulario: sufijo `FormValues` → `LoginFormValues`
- View models UI: sufijo `View` → `ProductCardView`, `ProductDetailView`

### Alineación con el backend (Java)

| Backend | Frontend |
|---------|----------|
| `DatosRespuestaProducto` | `productApiSchema` → `ProductApi` |
| `DatosCrearProducto` | `createProductRequestSchema` |
| `EstadoOrden` | `orderStatusSchema` |
| `BigDecimal` | `moneySchema` (`z.coerce.number()`) |
| `LocalDateTime` | string ISO validado con Zod |
| Spring `Page<T>` | `createSpringPageSchema(itemSchema)` |

### Componentes React

- Preferir **named exports** en el design system (`export const Button`).
- `default export` aceptado en pages y widgets montados por el router.
- Props tipadas con `type XxxProps = { … }`.
- Composición con `forwardRef` en inputs del design system.

---

## Estilos y CSS Modules

### Estilos globales (`app/styles/`)

Importados **una sola vez** desde `main.tsx` vía `@/app/styles`:

| Archivo | Rol |
|---------|-----|
| `tokens.css` | Design tokens (`--bg`, `--surface`, `--accent`…) |
| `animations.css` | Keyframes compartidos |
| `reset.css` | Normalización base |
| `utilities.css` | Clases utilitarias puntuales |
| `index.css` | Orquesta los imports anteriores |

Los tokens son la **única fuente de verdad** del tema. En componentes, preferir `var(--text)`, `var(--border)`, etc., sobre colores hardcodeados.

### CSS Modules (componentes)

Todo estilo **scoped a un componente** va en `NombreComponente.module.css` junto al TSX.

```tsx
import clsx from 'clsx';
import styles from './ProductInfo.module.css';

export function ProductInfo({ destacado }: Props) {
  return (
    <section className={clsx(styles.root, destacado && styles.destacado)}>
      <h1 className={styles.title}>…</h1>
    </section>
  );
}
```

**Convenciones de clases en modules:**

| Patrón | Uso |
|--------|-----|
| `.root` | Contenedor principal del componente |
| `.title`, `.text`, `.actions` | Elementos semánticos |
| `.btnPrimary`, `.btnSecondary` | Variantes (combinar con `clsx`) |
| `.embedded`, `.compact` | Modificadores de layout |
| `.invalid`, `.disabled` | Estados |

- Nombres en **camelCase** dentro del module (Vite los exporta tal cual).
- Modificadores con **`clsx`**, no strings concatenadas.
- Evitar `:global()` salvo casos excepcionales; preferir props/`className` en el componente hijo.
- **No** importar `.css` planos en componentes; solo `.module.css`.
- El design system comparte estilos base en `shared/ui/Input/control.module.css` (inputs, selects, textareas).

### Composición entre modules

Cuando un componente padre necesita una variante de un hijo, pasar `className` al hijo en lugar de sobrescribir con selectores globales:

```tsx
import shippingStyles from '@/features/order/ui/OrderShippingSummary/OrderShippingSummary.module.css';

<OrderShippingSummary className={shippingStyles.embedded} />
```

---

## Datos, validación y formularios

### Flujo de datos

```
Backend JSON  →  Zod schema (parseApi)  →  types + mappers  →  UI
Formulario    →  Zod form schema       →  request DTO      →  API
```

### Parseo de respuestas

```ts
import { parseApi } from '@/shared';
import { productApiSchema, type ProductApi } from '@/entities/product';

const raw = await res.json();
const product: ProductApi = parseApi(productApiSchema, raw);
```

### Formularios (React Hook Form + Zod)

```ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginFormSchema, type LoginFormValues } from '@/entities/user';

const form = useForm<LoginFormValues>({
  resolver: zodResolver(loginFormSchema),
});
```

### Capa API

Las llamadas HTTP viven en `entities/*/api/*Api.ts`. Importar el objeto API desde el barrel:

```ts
import { authApi } from '@/entities/user';
import { cartApi } from '@/entities/cart';
import { orderApi } from '@/entities/order';
import { paymentApi } from '@/features/checkout';
```

---

## Routing y layouts

El router está en `app/router/AppRouter.tsx`. **Todas las páginas se cargan con `React.lazy` (code-splitting por ruta)** y se montan bajo un `<Suspense>` con un fallback de carga (`LazyRouteFallback`) para que el bundle inicial sea mínimo y cada vista descargue su chunk bajo demanda.

| Layout | Rutas | Shell |
|--------|-------|-------|
| `ShopLayout` + categorías | `/`, `/catalogo`, `/categoria/*`, `/producto/:slug` | Navbar + CategoriasNav + Footer |
| `ShopLayout` sin categorías | login, registro, perfil, carrito, checkout | Navbar + Footer |
| `AdminLayout` | `/admin/*` | Navbar admin |

- Ruta canónica del carrito: **`/cart`** (`/carrito` redirige).
- Rutas protegidas: `PrivateRoute` con rol (`ROLE_CUSTOMER`, `ROLE_ADMIN`).
- Providers de página: `ProfileProvider` en `/profile`, `CheckoutProvider` en `/checkout`.

---

## API pública (barrels)

Cada slice exporta solo lo necesario desde su `index.ts`. Ejemplos:

```ts
// entities
import { useProducts, productApi, type ProductApi } from '@/entities/product';

// features
import { SessionExpiryWarning } from '@/features/auth';
import { useCheckoutLogic, paymentApi } from '@/features/checkout';

// widgets
import CatalogView from '@/widgets/catalog/CatalogView';

// pages
import { HomePage } from '@/pages/home';

// shared UI
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';

// app
import { useAuth, useCart } from '@/app/providers';
```

No importar archivos internos de otro slice (`entities/product/model/schemas/api.ts`) desde fuera del slice.

---

## Buenas prácticas de desarrollo

1. **Respetar las capas FSD** — si necesitas lógica compartida entre features, baja a `entities` o sube a `widgets`.
2. **Pages delgadas** — routing y providers en la page; markup en widgets/features.
3. **Tipado estricto** — `strict: true` en TypeScript; evitar `any`.
4. **Validar en el borde** — toda respuesta HTTP pasa por Zod antes de llegar a la UI.
5. **Design system primero** — usar `Button`, `Input`, `FormField`, `Select` de `shared/ui` antes de crear controles ad hoc.
6. **CSS Modules para componentes** — tokens globales solo para tema y reset.
7. **Barrels limpios** — exportar solo la API pública; ocultar detalles de implementación.
8. **Sin lógica en el router** — el router compone layouts y pages, no fetch ni estado de negocio.

### Añadir un feature nuevo (checklist)

- [ ] ¿Es dominio puro? → `entities/<nombre>/`
- [ ] ¿Es acción de usuario? → `features/<nombre>/` con `model/` y/o `ui/`
- [ ] ¿Es bloque compuesto de varias features? → `widgets/<nombre>/`
- [ ] ¿Es una ruta nueva? → `pages/<nombre>/ui/` + registro en `AppRouter`
- [ ] Crear/actualizar `index.ts` del slice
- [ ] Estilos en `*.module.css` con tokens `var(--*)`

---

## Build y despliegue

```bash
# Build de producción
pnpm run build

# Preview local del build
pnpm run preview
```

El output queda en `frontend/dist/`. Servir como SPA estática; configurar fallback a `index.html` en el servidor (nginx, CDN, etc.).

En producción, definir `VITE_API_URL` apuntando al backend desplegado.

### Configuración de despliegue en Netlify

El repo incluye `netlify.toml` en la raíz con:

- **Build**: base `frontend`, publish `frontend/dist`, command `pnpm install && pnpm build`
- **SPA fallback**: `/*` → `/index.html` (status 200)
- **Cache headers** para assets con hash (`/assets/*`): `Cache-Control: public, max-age=31536000, immutable`
- **Shell sin cache**: `/index.html` → `no-cache`

### Optimizaciones de build y seguridad

- **Code-splitting y vendor chunks**: Vite genera chunks por ruta lazy (`index-*.js`) + vendor chunks aislados: `react-vendor` (React, Router) y `forms-vendor` (`zod`, `react-hook-form`).
- **Encabezados HTTP de seguridad**: Configuración en `netlify.toml` con `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` y `Referrer-Policy`.
- **Fuentes autoalojadas optimizadas**: 4 familias (`@fontsource/*`) importadas con subconjuntos `latin` y `font-display: swap`. Se consolidó la tipografía primaria en `Instrument Sans`, ahorrando ~170KB de fuentes redundantes.
- **LCP / CLS & Art Direction**: Hero Carousel con `<picture>` nativo (`mobileSrc` vs `desktopSrc`), `fetchpriority="high"` + `aspect-ratio` adaptativo (16:5 desktop / 6:4 mobile); `preconnect` a dominios de medios.
- **Caché en Memoria API**: Deduplicación de peticiones y memoria en `useProducts` y `useCategorias` para navegación instantánea (0ms).

---

## Testing

El frontend usa una estrategia en dos capas:

| Capa | Herramientas | Qué prueba |
|------|--------------|------------|
| Unit / integración | Vitest, React Testing Library, MSW | Helpers, componentes aislados, funciones API |
| E2E | Cypress | Flujos reales en navegador (catálogo, login, …) |

```bash
# Tests rápidos (sin backend real — MSW intercepta fetch)
pnpm test

# Modo watch durante desarrollo
pnpm test:watch

# E2E: levanta Vite + Cypress (también sin backend — cy.intercept)
pnpm test:e2e
```

**Convenciones:**

- Archivos `*.test.ts(x)` colocados junto al código bajo `src/`.
- Mocks centralizados en `src/test/msw/` (fixtures reutilizados por Cypress).
- `VITE_API_URL` del `.env` debe coincidir entre app, Vitest y handlers MSW.

Guía completa (handlers, fixtures, comandos Cypress, plan de cobertura, troubleshooting): **[docs/testing.md](./docs/testing.md)**.

---

## Documentación relacionada

| Documento | Contenido |
|-----------|-----------|
| [docs/Evaluacion-Seguridad-Frontend.md](./docs/Evaluacion-Seguridad-Frontend.md) | Evaluación de seguridad, corrección de vulnerabilidades XSS y guía de migración JWT a Cookies `HttpOnly` |
| [docs/Evaluacion-Rendimiento-Frontend.md](./docs/Evaluacion-Rendimiento-Frontend.md) | Análisis de rendimiento, chunking en Vite, LCP/CLS y eliminación de fetch waterfalls |
| [docs/pnpm.md](./docs/pnpm.md) | Instalación de pnpm, migración desde npm, scripts y troubleshooting |
| [docs/eslint-warnings.md](./docs/eslint-warnings.md) | Warnings ESLint: inventario, rendimiento y seguimiento de mejoras |
| [docs/architecture-fsd.md](./docs/architecture-fsd.md) | Referencia detallada FSD: mapeo legacy, hooks, providers, entities, rutas |
| [docs/payment-gateways.md](./docs/payment-gateways.md) | Pasarelas de pago simuladas e integración real (Stripe, Webpay Plus, Mercado Pago) |
| [docs/testing.md](./docs/testing.md) | Vitest, RTL, MSW, Cypress: scripts, fixtures, evaluación de buenas prácticas y plan de cobertura |
| [docs/README.md](./docs/README.md) | Índice de la documentación del frontend |

---

## Licencia

Proyecto privado JEPLabs. Consultar el repositorio raíz para términos de uso y contribución.
