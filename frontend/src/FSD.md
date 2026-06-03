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
| Spring `Page<T>`           | `createSpringPageSchema(itemSchema)`     |

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

## Próximos pasos de migración sugeridos

1. **Servicios** restantes (`envio`, `direccion`, `cart`, `orden`, `product`, …) → `entities/*/api` con `parseApi`.
2. **Utils de dominio** (`envioHelpers.js`, `ordenDisplayHelpers.js`) → reemplazar por `@/entities/shipping` y `@/entities/order`.
3. **Contextos** → `app/providers` + hooks en `features/*/model`.
4. **Componentes** → mover a `widgets/` o `features/` según responsabilidad.

## Notas del dominio actual

- **Orden**: crear orden envía `{ direccionId, servicioEnvioId, formaPago, notas }`; ítems vienen del carrito en servidor.
- **Pago simulado** (Stripe/Webpay) es solo frontend; `FormaPago` en backend = envío en línea vs contra entrega.
- **Producto admin**: `DatosRespuestaProductoAdmin` no incluye `descripcion`/`categorias`; combinar con endpoint público si hace falta en edición.
- **Usuario**: perfil no incluye direcciones; usar entity `address` por separado.
- **Direcciones — pendiente backend**: `PATCH /api/direcciones/{id}` acepta `referencias` en `DatosActualizarDireccion`, pero `Direccion.actualizar()` no asigna ese campo (crear sí). El frontend ya envía `referencias` en el PATCH vía `mapAddressFormToUpdateRequest`.
