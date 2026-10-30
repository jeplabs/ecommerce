# Integración de Sucursales y Retiro en Tienda en Frontend

Este documento detalla la arquitectura, contratos, flujo de usuario y cobertura de pruebas de la integración del frontend con el backend para la selección de sucursales físicas y pedidos con modalidad de **Retiro en Tienda**.

---

## 1. Arquitectura en Frontend (FSD)

Siguiendo la arquitectura **Feature-Sliced Design**, la funcionalidad se organiza en capas desacopladas:

```
src/
├── entities/
│   ├── branch/                  # Dominio de sucursales
│   │   ├── api/branchApi.ts     # Client HTTP (listar sucursales activas)
│   │   ├── api/branchApi.test.ts
│   │   ├── model/schemas/api.ts # Validación Zod y tipos TypeScript
│   │   └── index.ts             # API pública del slice
│   ├── shipping/                # Esquemas de envío con retiroTienda
│   └── order/                   # Creación de orden y snapshot inmutable con horario
│
├── features/
│   ├── checkout/
│   │   ├── model/useCheckoutLogic.ts # Estado global de checkout, carga y validación
│   │   └── ui/
│   │       ├── PickupBranchSelector/ # Lista de selección de sucursales
│   │       └── ShippingServiceSelector/
│   └── order/
│       └── ui/OrderShippingSummary/  # Resumen y detalle con datos de la sucursal y horario
```

---

## 2. Contratos y Endpoints Consumidos

### 2.1. Listado de sucursales activas
- **Endpoint**: `GET /api/sucursales`
- **Acceso**: Público (`permitAll`).
- **Comportamiento**: Devuelve todas las sucursales con `activo = true`, ordenadas ascendentemente por `ordenVisualizacion` y luego por `id`.
- **Esquema Zod (`branchApiSchema`)**:
  ```ts
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
  ```

### 2.2. Opciones de Envío (`GET /api/envio/opciones`)
Cada servicio de entrega incluye el booleano `retiroTienda`:
```json
{
  "id": 1,
  "nombre": "Retiro en tienda",
  "descripcion": "Recoge tu pedido en nuestra sucursal",
  "tarifa": 0.00,
  "retiroTienda": true
}
```
En `entities/shipping/model/mappers.ts`, `isPickupService` prioriza `servicio.retiroTienda === true` con fallback por nombre descriptivo.

### 2.3. Creación de Orden (`POST /api/ordenes`)
El payload discrimina según el tipo de entrega:
- **Retiro en tienda**:
  ```json
  {
    "direccionId": null,
    "sucursalId": 2,
    "servicioEnvioId": 1,
    "formaPagoEnvio": "EN_LINEA",
    "metodoPagoCodigo": "TRANSFERENCIA",
    "notas": "Paso por la tarde"
  }
  ```
- **Envío a domicilio**:
  ```json
  {
    "direccionId": 5,
    "sucursalId": null,
    "servicioEnvioId": 2,
    "formaPagoEnvio": "EN_LINEA",
    "metodoPagoCodigo": "STRIPE",
    "notas": null
  }
  ```

### 2.4. Snapshot de la Orden (`DatosRespuestaOrden`)
Cuando una orden es de retiro en tienda, el backend genera un snapshot inmutable en `direccionEnvio` que incluye el campo `horario` de la sucursal elegida:
```json
{
  "id": 102,
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
  }
}
```

---

## 3. Reglas de Negocio y Experiencia de Usuario (UX)

### 3.1. Selección Consciente (Sin Auto-selección)
Por directriz del proyecto, **no se auto-selecciona ninguna sucursal ni dirección por defecto**.
- `selectedBranchId` inicia estrictamente en `null`.
- Si el usuario selecciona el servicio "Retiro en tienda", debe pulsar explícitamente sobre una de las sucursales listadas.
- La validación `canContinueShipping` en `useCheckoutLogic` bloquea el avance al paso de pago (`false`) mientras `selectedBranchId` sea `null`.

### 3.2. Estados del Componente `PickupBranchSelector`
- **Carga (`loadingBranches = true`)**: Muestra mensaje de carga sin bloquear la interfaz.
- **Vacío (`sucursales.length === 0`)**: Muestra mensaje informativo indicando que no hay sucursales disponibles en el momento.
- **Lista de opciones**: Renderiza tarjetas interactivas de tipo radio con nombre, dirección completa, horario de atención y teléfono de contacto.

### 3.3. Visualización en Resúmenes y Detalle de Orden (`OrderShippingSummary`)
- Si la orden contiene `sucursalId != null` o el servicio corresponde a retiro:
  - El encabezado cambia dinámicamente de "Dirección de envío" a **"Sucursal de retiro"**.
  - Se muestra el nombre de la sucursal, dirección y el `horario` de retiro.
  - La nota informativa indica las instrucciones de retiro en tienda física.

---

## 4. Pruebas y Cobertura

La integración cuenta con suite de pruebas automatizadas:

| Test Suite | Alcance |
|------------|---------|
| `entities/branch/api/branchApi.test.ts` | Parsing de esquema Zod y manejo de errores HTTP. |
| `features/checkout/ui/PickupBranchSelector.test.tsx` | Renderizado de sucursales, selección interactiva por clic, estados de carga y vacío. |
| `features/checkout/model/useCheckoutLogic.test.tsx` | Flujo end-to-end de retiro en tienda, validación de selección consciente y envío de `sucursalId` con `direccionId: null`. |
| `features/order/ui/OrderShippingSummary.test.tsx` | Renderizado adaptativo de "Sucursal de retiro", datos de contacto y horario snapshot. |
| `test/msw/` | Fixtures y handlers simulando el endpoint real del backend Spring Boot. |

