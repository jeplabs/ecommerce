# Integración de Sucursales y Retiro en Tienda en Frontend

Este documento detalla la arquitectura, contratos, flujo de usuario y cobertura de pruebas de la integración del frontend con el backend para la selección de sucursales físicas y pedidos con modalidad de **Retiro en Tienda**.

---

## 1. Arquitectura en Frontend (FSD)

Siguiendo la arquitectura **Feature-Sliced Design**, la funcionalidad se organiza en capas desacopladas:

```
src/
├── entities/
│   ├── branch/                      # Dominio de sucursales
│   │   ├── api/branchApi.ts         # Client HTTP público y admin
│   │   ├── api/branchApi.test.ts    # Tests cliente público
│   │   ├── api/branchApi.admin.test.ts # Tests cliente admin
│   │   ├── model/schemas/api.ts     # Esquemas Zod y tipos TypeScript (API)
│   │   ├── model/schemas/forms.ts   # Esquema Zod de formulario de sucursal
│   │   └── index.ts                 # API pública del slice
│   ├── shipping/                    # Esquemas de envío con retiroTienda
│   └── order/                       # Creación de orden y snapshot inmutable con horario
│
├── features/
│   ├── checkout/
│   │   ├── model/useCheckoutLogic.ts # Estado de checkout y selección de sucursal
│   │   └── ui/
│   │       ├── PickupBranchSelector/ # Lista interactiva de sucursales en checkout
│   │       └── ShippingServiceSelector/
│   ├── admin/
│   │   ├── model/useAdminBranches.ts # Hook con lógica de negocio CRUD admin
│   │   ├── model/useAdminBranches.test.tsx
│   │   └── ui/
│   │       ├── AdminBranchesTable/   # Tabla responsiva de sucursales
│   │       └── BranchModalForm/      # Modal de creación y edición
│   └── order/
│       └── ui/OrderShippingSummary/  # Resumen y detalle con datos de la sucursal y horario
│
├── widgets/
│   ├── admin/
│   │   ├── AdminBranchesView.tsx     # Vista compuesta con métricas, tabla y modal
│   │   └── AdminBranchesView.test.tsx
│   └── layout/AdminLayout/           # Navegación y enlace a /admin/sucursales
│
└── pages/
    └── admin/branches/               # Ruta protegida /admin/sucursales (ROLE_ADMIN)
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



---

## 5. Módulo de Administración de Sucursales (`/admin/sucursales`)

El panel de administración incluye gestión integral de los puntos de retiro físico bajo `ROLE_ADMIN`:

### 5.1. Endpoints Consumidos en Modo Admin
- `GET /api/sucursales/admin`: listado completo (activas e inactivas).
- `GET /api/sucursales/admin/{id}`: detalle por ID.
- `POST /api/sucursales`: alta de sucursal con `DatosCrearSucursal`.
- `PATCH /api/sucursales/{id}`: edición parcial con `DatosActualizarSucursal`.
- `PATCH /api/sucursales/{id}/activar`: reactivación (`204 No Content`).
- `DELETE /api/sucursales/{id}`: desactivación soft-delete (`204 No Content`).

### 5.2. Componentes y Flujo
1. **Pestaña en Navegación**: Integrado en `AdminLayout` con enlace `/admin/sucursales`.
2. **Hook `useAdminBranches`**: Gestiona el ciclo de vida del CRUD con feedback inmediato vía toasts (`useToast`) y manejo de sesiones expiradas (`redirectUnauthorized`).
3. **Tabla `AdminBranchesTable`**: Visualización de sucursales con orden de visualización, dirección, ciudad, horario, teléfono, badges de estado (Activa / Inactiva) y botones de acción (Editar y Activar/Desactivar con confirmación modal).
4. **Formulario `BranchModalForm`**: Modal reutilizable para alta y edición validado con Zod (`branchFormSchema`) y React Hook Form.

### 5.3. Diseño Responsivo y Experiencia de Usuario (UI/UX)
- **Adaptabilidad de la Tabla en Tablet y Móvil (`<= 900px`)**:
  - **Badges de estado (`● Activa` / `○ Inactiva`)**: Cuentan con `white-space: nowrap;` y `flex-shrink: 0;`, asegurando que el glifo circular y el texto permanezcan unidos en un solo renglón sin quiebres de línea no deseados.
  - **Botones de acción**: En resoluciones de tablet y móviles, los botones ("Editar" y "Activar/Desactivar") pasan de alineación horizontal a apilarse verticalmente en columna centrada (`flex-direction: column; align-items: center; justify-content: center; gap: 0.35rem;`), con ancho completo uniforme (`width: 100%; min-width: 5.5rem; text-align: center;`) que facilita la interacción táctil.
- **Modal de Formulario (`BranchModalForm`)**:
  - **Jerarquía z-index frente al Navbar**: El fondo oscuro (`.overlay`) se posiciona con `z-index: 20000;`, superando al `Navbar` sticky de la aplicación (`z-index: 10000;`). Esto atenúa la pantalla completa, impide la interacción no deseada con la barra de navegación superior mientras el modal está activo y evita que el header del modal quede tapado o cortado.
  - **Contención de Elementos y Scroll Interno**: El modal se estructura con flexbox vertical (`display: flex; flex-direction: column; max-height: calc(100vh - 3.5rem); overflow: hidden;`). La etiqueta `<form>` hereda `min-height: 0; flex: 1 1 auto; overflow: hidden;`, encapsulando el scroll en el cuerpo `.body` (`overflow-y: auto;`). Esto garantiza que tanto la cabecera como el pie de acciones (`Cancelar` / `Guardar`) permanezcan siempre fijos con su fondo intacto, mientras los campos se desplazan limpiamente en pantallas de cualquier altura.

### 5.4. Cobertura de Pruebas Admin
- `src/entities/branch/api/branchApi.admin.test.ts`: Pruebas de integración para cada llamada HTTP admin (`listarAdmin`, `crearAdmin`, `actualizarAdmin`, `activarAdmin`, `desactivarAdmin`).
- `src/features/admin/model/useAdminBranches.test.tsx`: Pruebas de integración del hook con estado y llamadas a la API.
- `src/features/admin/ui/AdminBranchesTable/AdminBranchesTable.test.tsx`: Renderizado, eventos de edición/desactivación y comportamiento del layout.
- `src/widgets/admin/AdminBranchesView.test.tsx`: Flujo completo de la vista de administración, apertura y cierre del modal y confirmaciones.
