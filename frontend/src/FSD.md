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

## Migración de servicios (en curso)

| Servicio legacy | Nueva ubicación | Estado |
|-----------------|-----------------|--------|
| `services/authService.js` | `entities/user/api/authApi.ts` | Hecho — `authService.js` re-exporta la API tipada |
| `services/envioService.js` | `entities/shipping/api/shippingApi.ts` | Hecho — `envioService.js` re-exporta la API tipada |
| `services/direccionService.js` | `entities/address/api/addressApi.ts` | Hecho — `direccionService.js` re-exporta la API tipada |
| `services/cartService.js` | `entities/cart/api/cartApi.ts` | Hecho — `cartService.js` re-exporta la API tipada |
| `services/ordenService.js` | `entities/order/api/orderApi.ts` | Hecho — `ordenService.js` re-exporta la API tipada |
| `services/productService.js` | `entities/product/api/productApi.ts` | Hecho — `productService.js` re-exporta la API tipada |
| `services/categoriasService.js` | `entities/category/api/categoryApi.ts` | Hecho — `categoriasService.js` re-exporta la API tipada |
| `services/profileService.js` | `entities/user/api/profileApi.ts` | Hecho — `profileService.js` re-exporta la API tipada |
| `services/paymentService.js` | `features/checkout/api/paymentApi.ts` | Hecho — pasarela simulada (sin backend); `paymentService.js` re-exporta |

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

Los archivos en `src/context/*` re-exportan desde `@/app/providers` (compatibilidad).

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

`src/hooks/*` re-exporta las rutas nuevas (compatibilidad).

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
| `filterHelpers.js` | re-export de `filter-facets` (deprecated) |

`src/utils/*` re-exporta las rutas nuevas (compatibilidad). APIs y hooks ya importan `@/shared` / entities / features.

## Próximos pasos de migración sugeridos

1. **Componentes** → `widgets/` o `features/` según responsabilidad.
2. Ir actualizando imports de `@/hooks/...` y `@/utils/...` a rutas FSD directas en JSX legacy.

## Notas del dominio actual

- **Orden**: crear orden envía `{ direccionId, servicioEnvioId, formaPago, notas }`; ítems vienen del carrito en servidor.
- **Pago simulado** (Stripe/Webpay) vive en `features/checkout` — no crea cargo real; `FormaPago` en backend = envío en línea vs contra entrega.
- **Producto admin**: `DatosRespuestaProductoAdmin` no incluye `descripcion`/`categorias`; combinar con endpoint público si hace falta en edición.
- **Usuario**: perfil no incluye direcciones; usar entity `address` por separado.
- **Direcciones — pendiente backend**: `PATCH /api/direcciones/{id}` acepta `referencias` en `DatosActualizarDireccion`, pero `Direccion.actualizar()` no asigna ese campo (crear sí). El frontend ya envía `referencias` en el PATCH vía `mapAddressFormToUpdateRequest`.
