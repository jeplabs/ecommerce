# Guía de Integración para Frontend: Sucursales y Retiro en Tienda (`sucursales`)

Esta guía documenta los nuevos contratos del **Backend** para reemplazar el mock `MOCK_BRANCHES` en el frontend (`PickupBranchSelector.tsx` y `ShippingServiceSelector.tsx`) y conectar la selección de sucursal con la creación y consulta de órdenes (`POST /api/ordenes` y `GET /api/ordenes`).

---

## 1. Endpoints de Sucursales (`/api/sucursales`)

### 1.1. Listar sucursales activas (Público — Checkout)
- **Método y Ruta**: `GET /api/sucursales`
- **Autenticación**: No requiere token JWT (`permitAll`).
- **Descripción**: Devuelve todas las sucursales físicas con `activo = true`, ordenadas ascendentemente por `ordenVisualizacion` y luego por `id`.
- **Respuesta `200 OK`**:
```json
[
  {
    "id": 1,
    "nombre": "Tienda Centro",
    "direccion": "Av. Principal 123, Ciudad de Guatemala",
    "ciudad": "Ciudad de Guatemala",
    "estado": "Guatemala",
    "codigoPostal": "01001",
    "pais": "GT",
    "telefono": "+502 2345-6789",
    "horario": "Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00",
    "referencias": "Zona 1, Centro Histórico",
    "mapaUrl": null,
    "activo": true,
    "ordenVisualizacion": 1,
    "creadoAt": "2026-10-29T15:00:00",
    "actualizadoAt": "2026-10-29T15:00:00"
  },
  {
    "id": 2,
    "nombre": "Tienda Zona 10",
    "direccion": "Boulevard Los Proceres 5-50, Zona 10",
    "ciudad": "Ciudad de Guatemala",
    "estado": "Guatemala",
    "codigoPostal": "01010",
    "pais": "GT",
    "telefono": "+502 2456-7890",
    "horario": "Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00",
    "referencias": "Plaza Comercial Zona 10",
    "mapaUrl": null,
    "activo": true,
    "ordenVisualizacion": 2,
    "creadoAt": "2026-10-29T15:00:00",
    "actualizadoAt": "2026-10-29T15:00:00"
  }
]
```

### 1.2. Endpoints de Administración (Solo `ROLE_ADMIN`)
Todos requieren encabezado `Authorization: Bearer <token_admin>`:

| Método | Ruta | Descripción | Cuerpo / Respuesta |
|---|---|---|---|
| `GET` | `/api/sucursales/admin` | Lista todas las sucursales (activas e inactivas) | `200 OK` (`DatosRespuestaSucursal[]`) |
| `GET` | `/api/sucursales/admin/{id}` | Obtiene el detalle de una sucursal por ID | `200 OK` (`DatosRespuestaSucursal`) |
| `POST` | `/api/sucursales` | Crea una nueva sucursal activa | `200 OK` (`DatosRespuestaSucursal`) |
| `PATCH` | `/api/sucursales/{id}` | Actualiza parcialmente una sucursal | `200 OK` (`DatosRespuestaSucursal`) |
| `PATCH` | `/api/sucursales/{id}/activar` | Reactiva una sucursal desactivada | `204 No Content` |
| `DELETE` | `/api/sucursales/{id}` | Desactiva una sucursal (soft-delete) | `204 No Content` |

---

## 2. Nuevo Campo `retiroTienda` en Opciones de Envío (`GET /api/envio/opciones`)

Cada elemento dentro de `servicios` en `GET /api/envio/opciones` ahora incluye el booleano `retiroTienda`:

```json
{
  "id": 3,
  "nombre": "Retiro en tienda",
  "descripcion": "Recoge tu pedido en nuestra sucursal",
  "tarifa": 0.00,
  "recargoContraEntrega": 0.00,
  "costoEnLinea": 0.00,
  "costoContraEntrega": 0.00,
  "logoUrl": null,
  "sinContraEntrega": false,
  "retiroTienda": true,
  "notaExpress": null
}
```
> **Recomendación**: En `entities/shipping/model/mappers.ts`, `isPickupService(servicio)` puede priorizar `if (typeof servicio.retiroTienda === 'boolean') return servicio.retiroTienda;` manteniendo el fallback por nombre (`nombre.toLowerCase().includes('retiro')`).

---

## 3. Contrato Actualizado de Órdenes (`POST /api/ordenes` y `GET /api/ordenes`)

### 3.1. Request de Creación (`POST /api/ordenes`)
El DTO `DatosCrearOrden` ahora acepta `direccionId` o `sucursalId` según el tipo de servicio de envío elegido:

- **Caso A — Envío a domicilio (Normal / Express)**:
  ```json
  {
    "direccionId": 5,
    "sucursalId": null,
    "servicioEnvioId": 1,
    "formaPagoEnvio": "EN_LINEA",
    "metodoPagoCodigo": "WEBPAY",
    "notas": "Dejar en garita"
  }
  ```
- **Caso B — Retiro en tienda (`retiroTienda = true`)**:
  ```json
  {
    "direccionId": null,
    "sucursalId": 2,
    "servicioEnvioId": 3,
    "formaPagoEnvio": "EN_LINEA",
    "metodoPagoCodigo": "TRANSFERENCIA",
    "notas": "Paso a recoger por la tarde"
  }
  ```

**Reglas de validación en el Backend**:
- Si el servicio elegido es **Retiro en tienda**, `sucursalId` es obligatorio y debe corresponder a una sucursal activa (`activo = true`). No se exige que el usuario tenga direcciones registradas.
- Si el servicio elegido es **Envío a domicilio**, `direccionId` es obligatorio, debe pertenecer al usuario autenticado y estar activa.

### 3.2. Respuesta de la Orden (`DatosRespuestaOrden`)
Cuando una orden es de **Retiro en tienda**, el backend guarda `sucursalId` y genera automáticamente un **snapshot inmutable** de la ubicación de la sucursal dentro de `direccionEnvio` (incluyendo el nuevo campo `horario`):

```json
{
  "id": 42,
  "estado": "PENDIENTE",
  "direccionId": null,
  "sucursalId": 2,
  "direccionEnvio": {
    "alias": "Tienda Zona 10",
    "calle": "Boulevard Los Proceres 5-50, Zona 10",
    "ciudad": "Ciudad de Guatemala",
    "estado": "Guatemala",
    "codigoPostal": "01010",
    "pais": "GT",
    "telefono": "+502 2456-7890",
    "referencias": "Plaza Comercial Zona 10",
    "horario": "Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00"
  },
  "servicioEnvio": "Retiro en tienda",
  "formaPagoEnvio": "EN_LINEA",
  "metodoPago": "TRANSFERENCIA",
  "metodoPagoNombre": "Transferencia Bancaria",
  "tipoMetodoPago": "TRANSFERENCIA",
  "items": [],
  "subtotal": 2799.00,
  "iva": 299.89,
  "costoEnvio": 0.00,
  "notaEnvio": null,
  "total": 2799.00
}
```

---

## 4. Guía Paso a Paso para Implementar en el Frontend

### Paso 1: Crear la entidad `branch` en `src/entities/branch`
1. **`src/entities/branch/model/schemas/api.ts`**:
   ```ts
   import { z } from 'zod';
   import { positiveIntSchema } from '@/shared/lib/zod-helpers';

   export const branchApiSchema = z.object({
       id: positiveIntSchema,
       nombre: z.string(),
       direccion: z.string(),
       ciudad: z.string(),
       estado: z.string().nullable().optional(),
       codigoPostal: z.string().nullable().optional(),
       pais: z.string(),
       telefono: z.string(),
       horario: z.string(),
       referencias: z.string().nullable().optional(),
       mapaUrl: z.string().nullable().optional(),
       activo: z.boolean(),
       ordenVisualizacion: z.number().int().nullable().optional(),
   });

   export type BranchApi = z.infer<typeof branchApiSchema>;
   ```
2. **`src/entities/branch/api/branchApi.ts`**:
   ```ts
   import { z } from 'zod';
   import { API_URL } from '@/shared/config';
   import { ApiError, getErrorMessage, parseApi } from '@/shared';
   import { branchApiSchema, type BranchApi } from '../model/schemas/api';

   const branchListSchema = z.array(branchApiSchema);

   export async function listar(): Promise<BranchApi[]> {
       const response = await fetch(`${API_URL}/api/sucursales`, {
           method: 'GET',
           headers: { Accept: 'application/json' },
       });
       const raw = await response.json().catch(() => ({}));
       if (!response.ok) {
           throw new ApiError(getErrorMessage(raw, 'Error al listar sucursales'), response.status, raw);
       }
       return parseApi(branchListSchema, raw);
   }

   export const branchApi = { listar };
   ```

### Paso 2: Actualizar esquemas de `entities/order`
1. En `src/entities/order/model/schemas/forms.ts`:
   ```ts
   export const createOrderRequestSchema = z.object({
       direccionId: z.number().int().positive().nullable().optional(),
       sucursalId: z.number().int().positive().nullable().optional(),
       servicioEnvioId: z.number().int().positive(),
       formaPagoEnvio: formaPagoSchema,
       metodoPagoCodigo: metodoPagoCodigoSchema,
       notas: z.string().nullable().optional(),
   });
   ```
2. En `src/entities/order/model/schemas/api.ts`:
   - Agregar `horario: nullableStringSchema` en `orderShippingAddressApiSchema`.
   - Agregar `sucursalId: z.number().int().positive().nullable().optional()` en `orderApiSchema`.

### Paso 3: Conectar `useCheckoutLogic.ts`
1. Cargar `sucursales` mediante `branchApi.listar()` al montar el checkout (igual que `fetchDirecciones`), guardando `sucursales`, `loadingBranches` y calculando:
   ```ts
   const selectedBranch = useMemo(
       () => sucursales.find((b) => b.id === selectedBranchId) ?? null,
       [sucursales, selectedBranchId]
   );
   ```
2. En `completeCheckout()`, enviar `sucursalId` cuando `isPickupSelected` sea `true`:
   ```ts
   const orden = await orderApi.crearOrden({
       direccionId: isPickupSelected ? null : selectedAddressId,
       sucursalId: isPickupSelected ? selectedBranchId : null,
       servicioEnvioId: selectedServicioEnvioId,
       formaPagoEnvio: formaPagoEnvio,
       metodoPagoCodigo,
       notas: notas.trim() || null,
   });
   ```
   *(Asegurarse de incluir `isPickupSelected` y `selectedBranchId` en el arreglo de dependencias del `useCallback` de `completeCheckout`)*.

### Paso 4: Reemplazar `MOCK_BRANCHES` en `PickupBranchSelector.tsx` y `ShippingServiceSelector.tsx`
- En `PickupBranchSelector.tsx`: eliminar `MOCK_BRANCHES` (líneas 6-21) y leer `const { sucursales, loadingBranches, selectedBranchId, setSelectedBranchId } = useCheckout();`.
- En `ShippingServiceSelector.tsx`: eliminar el import de `MOCK_BRANCHES` y leer `selectedBranch` directamente de `useCheckout()`.
- En `OrderShippingSummary.tsx`: cuando la orden sea de retiro en tienda (`pickup === true` o `orden.sucursalId != null`), mostrar el título **"Sucursal de retiro"** y renderizar `direccion.horario` si está presente.
