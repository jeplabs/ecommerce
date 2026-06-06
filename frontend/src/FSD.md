# Frontend — Feature-Sliced Design (FSD)

Estructura objetivo para migrar el ecommerce React/Vite. Las **entities** reflejan el contrato del backend Spring (`DatosRespuesta*`, enums Java) sin modificar el servidor.

## Capas

```
src/
├── app/                    # Bootstrap: providers, router, estilos globales
│   ├── providers/
│   └── router/
├── pages/                  # Composición por ruta (thin — delega a widgets/features)
├── widgets/                # Bloques de UI compuestos (Navbar, ProductCatalog, CheckoutLayout)
├── features/               # Acciones de usuario (auth/login, cart/add-item, checkout/submit-order)
├── entities/               # Modelo de negocio + contratos API (Zod + types + mappers)
└── shared/                 # Utilidades sin dominio (api helpers, ui kit, lib)
```

### Reglas de dependencia (de arriba hacia abajo)

| Capa      | Puede importar de                          |
|-----------|---------------------------------------------|
| `app`     | pages, widgets, features, entities, shared |
| `pages`   | widgets, features, entities, shared        |
| `widgets` | features, entities, shared                 |
| `features`| entities, shared                         |
| `entities`| shared, otras entities (con cuidado)       |
| `shared`  | solo shared                                |

## Entities (implementadas)

Cada entity expone solo su **public API** vía `index.ts`:

```
entities/
├── product/
│   ├── index.ts
│   └── model/
│       ├── schemas/
│       │   ├── api.ts      # JSON del backend (parse con parseApi)
│       │   └── forms.ts    # React Hook Form → request DTOs
│       ├── types.ts        # Tipos inferidos + view models UI
│       └── mappers.ts      # api → view, labels, helpers
├── user/
├── order/
├── address/
├── category/
├── cart/
└── shipping/
```

### Convenciones de nombres

| Backend (Java)              | Frontend entity                          |
|----------------------------|------------------------------------------|
| `DatosRespuestaProducto`   | `productApiSchema` → `ProductApi`        |
| `DatosCrearProducto`       | `createProductRequestSchema`             |
| `EstadoOrden`              | `orderStatusSchema` (`PENDIENTE`, …)     |
| `FormaPago`                | `formaPagoSchema` (`EN_LINEA`, …)        |
| `Rol`                      | `userRoleSchema` (`ROLE_ADMIN`, …)       |
| `Long id`                  | `z.number().int().positive()`            |
| `BigDecimal`               | `moneySchema` (`z.coerce.number()`)      |
| `LocalDateTime`            | `localDateTimeSchema` (string ISO)       |
| Spring `Page<T>`           | `createSpringPageSchema(itemSchema)` — normaliza VIA_DTO (`page.size`, …) y formato plano |

### Uso en servicios (ejemplo migración gradual)

```ts
import { parseApi } from '@/shared';
import { productApiSchema, type ProductApi } from '@/entities/product';

const raw = await res.json();
const product: ProductApi = parseApi(productApiSchema, raw);
```

### Uso en formularios (RHF + Zod)

```ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginFormSchema, type LoginFormValues } from '@/entities/user';

const form = useForm<LoginFormValues>({
  resolver: zodResolver(loginFormSchema),
});
```

## Path aliases (`tsconfig` + Vite)

- `@/*` → `src/*`
- `@/entities/*`, `@/features/*`, `@/widgets/*`, `@/shared/*`, `@/app/*`

## APIs de datos (ex `services/`)

Implementación en `entities/*/api/*Api.ts` y `features/checkout/api/paymentApi.ts`. Importar el objeto **`xxxApi`** desde el barrel de la capa:

```ts
import { authApi, getPerfil } from '@/entities/user';
import { cartApi } from '@/entities/cart';
import { orderApi } from '@/entities/order';
import { paymentApi, PAYMENT_METHODS } from '@/features/checkout';
```

| Legacy (`services/*.js`) | API FSD |
|--------------------------|---------|
| `authService` | `entities/user` → `authApi` |
| `profileService` | `entities/user` → `profileApi` / `getPerfil`, `updatePerfil` |
| `cartService` | `entities/cart` → `cartApi` |
| `productService` | `entities/product` → `productApi` |
| `categoriasService` | `entities/category` → `categoryApi` |
| `direccionService` | `entities/address` → `addressApi` |
| `ordenService` | `entities/order` → `orderApi` |
| `envioService` | `entities/shipping` → `shippingApi` |
| `paymentService` | `features/checkout` → `paymentApi` (simulado) |

La carpeta **`src/services/`** fue eliminada.

## Features (implementadas)

```
features/
├── auth/model/           # useAuthLogic
├── catalog/model/        # useProductosByCategory, useProductFilterForm
├── admin/model/          # useAdminOrdersLogic, useAdminUser, useAdminUsersList
└── checkout/
    ├── api/paymentApi.ts
    └── model/            # payment schemas + useCheckoutLogic
```

## Providers (`app/providers`)

| Context legacy | Provider en `app/providers` | Ámbito |
|----------------|----------------------------|--------|
| `AuthContext` | `AuthProvider` | Global (`AppProviders`) |
| `ProductContext` | `ProductProvider` | Global |
| `CartContext` | `CartProvider` | Global |
| `CategoriasContext` | `CategoriasProvider` | Global |
| `ToastContext` | `ToastProvider` | Global |
| `ProfileContext` | `ProfileProvider` | Página `/profile` |
| `CheckoutContext` | `CheckoutProvider` | Página `/checkout` |
| `EnvioOpcionesContext` | `EnvioOpcionesProvider` | Dentro de `CheckoutProvider` |

La carpeta **`src/context/`** fue eliminada; solo existe `app/providers/`.

```jsx
// App.jsx
import { AppProviders } from '@/app/providers';

<AppProviders>
  <AppRouter />
</AppProviders>
```

## Hooks (migrados)

| Hook legacy | Ubicación FSD |
|-------------|---------------|
| `useAuthLogic` | `features/auth/model` |
| `useCheckoutLogic`, `useCheckoutSuccessRecommendations` | `features/checkout/model` |
| `useProductosByCategory`, `useProductFilterForm` | `features/catalog/model` |
| `useAdminOrdersLogic`, `useAdminUser`, `useAdminUsersList` | `features/admin/model` |
| `useCartLogic` | `entities/cart/model` |
| `useProducts` | `entities/product/model` |
| `useCategorias` | `entities/category/model` |
| `useProfileLogic` | `entities/user/model` |
| `useDireccionesLogic` | `entities/address/model` |
| `useOrdenesLogic` | `entities/order/model` |
| `useEnvioOpciones` | `entities/shipping/model` |
| `useClickOutside` | `shared/lib` |

Los hooks viven en `entities/*/model`, `features/*/model` o `shared/lib`. Importar desde el barrel de cada capa (`@/entities/product`, `@/features/checkout`, etc.).

Los hooks en `model/*.js` importados desde `index.ts` requieren `allowJs: true` en `tsconfig` (migración gradual). El aviso rojo del IDE (`TS7016`) desaparece con eso; al pasar cada hook a `.ts` se puede tipar el retorno.

## Utils y helpers (migrados)

| Legacy (`src/utils/`) | Ubicación FSD |
|----------------------|---------------|
| `apiHelpers.js` | `shared/lib/http-session` |
| `formatters.js` | `shared/lib/format` (+ `formatEstadoOrden` desde `entities/order`) |
| `jwtExpiry.js` | `shared/lib/jwt-expiry` |
| `envioHelpers.js` | `entities/shipping` (+ `FORMA_PAGO_ENVIO` en `entities/order`) |
| `ordenDisplayHelpers.js` | `entities/order` (`formatFormaPagoEnvio`, etc.) |
| `ordenEstados.js` | `entities/order/model/constants` |
| `productImages.js` | `entities/product/model/product-images` |
| `productFilterFacets.js` | `features/catalog/lib/filter-facets` |
| `catalogQueryParams.js` | `features/catalog/lib/catalog-query-params` |
| `checkoutRecommendations.js` | `features/checkout/lib/checkout-recommendations` |
| `productImageAdmin.js` | `features/admin/lib/product-image-admin` |
| `filterHelpers.js` | sustituido por `features/catalog/lib/filter-facets` |

Las carpetas legacy `src/hooks/` y `src/utils/` fueron **eliminadas** (enero 2026); el código usa solo rutas FSD.

## Componentes (migrados)

| Legacy (`src/components/`) | Ubicación FSD |
|---------------------------|---------------|
| `layout/Navbar`, `Footer`, `CategoriasNav`, `ProductCatalog` | `widgets/layout/` |
| `cart/CartDrawer` | `widgets/cart/` |
| `product/*` (galería, info, tabs) | `widgets/product-detail/` |
| `ui/Toast`, `Breadcrumbs`, `Carousel`, `Card`, `Dropdown`, `Form`, `SortSelector`, `ProductSlider` | `shared/ui/` |
| `ui/ProductFilters` | `features/catalog/ui/` |
| `auth/*` | `features/auth/ui/` |
| `checkout/*` | `features/checkout/ui/` |
| `profile/*` | `features/profile/ui/` |
| `admin/*` | `features/admin/ui/` |
| `orders/OrderShippingSummary` | `features/order/ui/` |

Barrels: `@/widgets`, `@/shared/ui`, `@/features/{auth,checkout,profile,admin,catalog,order}` (vía `index` de cada feature).

`src/components/` quedó vacío (eliminado). Las **pages** y **app** importan rutas FSD (`@/widgets/...`, etc.).

## Context → providers (migrado)

Todo el código importa hooks y providers desde **`@/app/providers`** (barrel en `app/providers/index.js`).

```js
import { useAuth, useCart, useToast } from '@/app/providers';
import { CheckoutProvider } from '@/app/providers';
```

## Hooks y utils en pages (migrado)

Las **pages** y UI activa importan hooks y constantes desde barrels FSD, no desde rutas relativas a `hooks/` o `utils/`:

| Antes | Ahora |
|-------|--------|
| `../hooks/useProducts` | `@/entities/product` |
| `../hooks/useProductosByCategory` | `@/features/catalog` |
| `../../hooks/useAdmin*` | `@/features/admin` |
| `../../utils/ordenEstados` | `@/entities/order` |
| `../../utils/productImageAdmin` | `@/features/admin` |
| `@/hooks/useProductFilterForm` | `@/features/catalog` |

## Router y layouts (migrado)

| Antes | Ubicación FSD |
|--------|---------------|
| `src/router/AppRouter.jsx` | `app/router/AppRouter.jsx` |
| `src/router/PrivateRoute.jsx` | `app/router/PrivateRoute.jsx` |
| Navbar + CategoriasNav + Footer en cada page | `widgets/layout/ShopLayout` (`<Outlet />`) |
| Solo Navbar en admin | `widgets/layout/AdminLayout` |

Rutas anidadas en `AppRouter`:

- **ShopLayout** con `showCategoriasNav`: `/`, `/catalogo`, `/categoria/*`, `/producto/:slug`
- **ShopLayout** sin categorías: login, registro, perfil, carrito, checkout
- **AdminLayout**: `/admin/*`

Las **pages** solo renderizan el contenido central; el shell lo define el layout.

La carpeta legacy `src/router/` fue **eliminada**; el router vive solo en `app/router/`.

Ruta canónica en la SPA: **`/cart`**. **`/carrito`** redirige a `/cart` (p. ej. enlace del email de carrito abandonado en el backend). La API REST sigue en `/api/carrito`.

## Config y sesión cliente (migrado)

| Antes | Ubicación FSD |
|--------|---------------|
| `src/config/config.js` | `shared/config/env.ts` → import `@/shared/config` |
| `src/auth/authSessionSync.js` | `shared/lib/auth-session-sync.ts` |

`auth-session-sync` vive en **shared** (no en `features/auth`) porque `shared/lib/http-session` lo usa: en FSD, `shared` no puede importar `features`.

Carpetas legacy `src/config/` y `src/auth/` eliminadas.

## Pages (FSD — composición por ruta)

Cada ruta tiene un **slice** en `pages/<nombre>/`:

```
pages/home/
  ui/HomePage.tsx    ← compone widgets; lee router si aplica
  index.ts           ← API pública del slice
```

**Reglas:**

- La **page** importa widgets (y features puntuales), arma la vista y concentra `useParams` / `useLocation` / `Navigate` / providers de ruta.
- Los **widgets** (`*View`, `HomeContent`) no usan `useParams` ni `useLocation`; reciben props (`slug`, `slugPath`, `onNavigate`, …).
- **Navbar / Footer** siguen en `ShopLayout` / `AdminLayout` (app), no se repiten en cada page.

| Page slice | Compone | Router en page |
|------------|---------|----------------|
| `pages/home` | `HomeContent` | `navigate` si no autenticado al agregar al carrito |
| `pages/catalog` | `CatalogView` | — |
| `pages/category` | `CategoryProductsView` | `useLocation` → `slugPath`, `segmentos` |
| `pages/product` | `ProductDetailView` + `<main>` | `useParams().slug` |
| `pages/cart` | `CartView` + `<main>` | `navigate` → checkout |
| `pages/checkout` | header + `CheckoutProvider` + `CheckoutContent` | — |
| `pages/checkout-success` | `CheckoutSuccessView` | `location.state`, `Navigate` |
| `pages/profile` | header + `ProfileProvider` + `ProfileContent` | `location.state.tab` |
| `pages/login`, `register` | forms (`shared` / `features`) | `navigate` en register |
| `pages/admin/*` | `Admin*View` | `useParams`, `navigate` según ruta |

Widgets renombrados: `*Page` → `*View` / `HomeContent`. Helpers: `widgets/catalog/lib/category-tree.js`.

Router: `import { HomePage } from '@/pages/home'` (barrel `@/pages` opcional).

## Hooks TypeScript (Fase B — en curso)

| Hook | Ubicación | Estado |
|------|-----------|--------|
| `useCartLogic` | `entities/cart/model` | ✅ `.ts` + `CartItemUiView`, `mapCartApiToUiItems` |
| `useCheckoutLogic` | `features/checkout/model` | ✅ `.ts` |
| `useCheckoutSuccessRecommendations` | `features/checkout/model` | ✅ `.ts` |
| `pickPostCheckoutProducts` | `features/checkout/lib` | ✅ `.ts` |
| `useAuthLogic` | `features/auth/model` | ✅ `.ts` |
| `useProfileLogic` | `entities/user/model` | ✅ `.ts` |
| `useProducts` | `entities/product/model` | ✅ `.ts` + `ProductMutationResult` |
| `useCategorias` | `entities/category/model` | ✅ `.ts` |
| `useDireccionesLogic` | `entities/address/model` | ✅ `.ts` + `AddressActionResult` |
| `useEnvioOpciones` | `entities/shipping/model` | ✅ `.ts` + `UseEnvioOpcionesResult` |
| `useOrdenesLogic` | `entities/order/model` | ✅ `.ts` + `OrderActionResult` |
| `useProductosByCategory` | `features/catalog/model` | ✅ `.ts` |
| `useProductFilterForm` | `features/catalog/model` | ✅ `.ts` |

**Entities:** todos los hooks `model/` en `.ts`.

### features/catalog (Fase B — migrado)

| Módulo | Estado |
|--------|--------|
| `useProductosByCategory`, `useProductFilterForm` | ✅ `.ts` |
| `filter-facets`, `catalog-query-params`, `category-path` | ✅ `.ts` |
| `model/types.ts` | `CatalogFiltros`, `CatalogFilterOpciones`, `CatalogSortOrder`, … |

Pendientes Fase B: `features/admin`, `widgets/catalog/lib/category-tree.js`, `home-slides.js`.

## Próximos pasos de migración sugeridos

1. Completar Fase B (hooks y libs restantes) y revisar `allowJs`.
2. Estilos globales (`index.css`, `App.css`) → `app/styles/`.

## Notas del dominio actual

- **Orden**: crear orden envía `{ direccionId, servicioEnvioId, formaPago, notas }`; ítems vienen del carrito en servidor.
- **Pago simulado** (Stripe/Webpay) vive en `features/checkout` — no crea cargo real; `FormaPago` en backend = envío en línea vs contra entrega.
- **Producto admin**: `DatosRespuestaProductoAdmin` no incluye `descripcion`/`categorias`; combinar con endpoint público si hace falta en edición.
- **Usuario**: perfil no incluye direcciones; usar entity `address` por separado.
- **Direcciones — pendiente backend**: `PATCH /api/direcciones/{id}` acepta `referencias` en `DatosActualizarDireccion`, pero `Direccion.actualizar()` no asigna ese campo (crear sí). El frontend ya envía `referencias` en el PATCH vía `mapAddressFormToUpdateRequest`.
