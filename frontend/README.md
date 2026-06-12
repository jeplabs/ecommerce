# JEPLabs Ecommerce — Frontend

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
| Lint | ESLint 9 (flat config) |
| Gestor de paquetes | [pnpm](https://pnpm.io/) |

---

## Requisitos

- **Node.js** 18 LTS o superior (recomendado 20+)
- **pnpm** 9+ (instalación detallada en [Documentación pnpm.md](./Documentación%20pnpm.md))
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
> consulta **[Documentación pnpm.md](./Documentación%20pnpm.md)** en este mismo directorio.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm run dev` | Servidor de desarrollo con HMR (puerto 5173) |
| `pnpm run build` | Build de producción en `dist/` |
| `pnpm run preview` | Sirve el build local para pruebas |
| `pnpm run lint` | ESLint sobre el proyecto |

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

Documentación de migración y mapeo legacy → FSD: **[src/FSD.md](./src/FSD.md)**.

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
│   ├── assets/             # Imágenes importadas por componentes
│   ├── App.tsx             # AppProviders + AppRouter
│   ├── main.tsx            # Punto de entrada React
│   └── FSD.md              # Referencia detallada de arquitectura
│
├── index.html
├── vite.config.js
├── tsconfig.json
├── eslint.config.js
├── package.json
├── pnpm-lock.yaml
├── Documentación pnpm.md   # Guía de pnpm del proyecto
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

El router está en `app/router/AppRouter.tsx`.

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

---

## Documentación relacionada

| Documento | Contenido |
|-----------|-----------|
| [Documentación pnpm.md](./Documentación%20pnpm.md) | Instalación de pnpm, migración desde npm, scripts y troubleshooting |
| [src/FSD.md](./src/FSD.md) | Referencia detallada FSD: mapeo legacy, hooks, providers, entities, rutas |

---

## Licencia

Proyecto privado JEPLabs. Consultar el repositorio raíz para términos de uso y contribución.
