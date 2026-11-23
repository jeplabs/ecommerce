# Reglas de Arquitectura y Desarrollo Frontend (`./frontend`)

Estas reglas aplican a todo el directorio `/frontend` (React 19 + TypeScript 6 + Vite 7). Todo cambio o nuevo desarrollo debe respetar estrictamente las convenciones, librerías reales instaladas en `package.json` y la arquitectura **Bulletproof React (BPR)**.

---

## 1. Stack Real y Restricciones de Dependencias

- **Instalado en `package.json`**:
  - Runtime / UI: `react` (19.2), `react-dom` (19.2), `react-router-dom` (7.x).
  - Lenguaje y Tipado: `typescript` (6.x, strict mode).
  - Bundler / Tooling: `vite` (7.x), `@vitejs/plugin-react`.
  - Formularios y Validación: `react-hook-form` (7.x), `@hookform/resolvers` (5.x), `zod` (4.x).
  - Estilos y UI: CSS Modules (`*.module.css`), variables CSS nativas (design tokens), `clsx`. Fuentes autoalojadas `@fontsource/*`.
  - Testing: `vitest` (4.x), `@testing-library/react` (16.x), `@testing-library/user-event` (14.x), `msw` (2.x), `cypress` (15.x).
  - Gestor de paquetes: **`pnpm`** (versión 9 o 10).
- **PROHIBIDO asumir o importar librerías no instaladas**:
  - **NO uses Axios** (el cliente HTTP usa `fetch` nativo encapsulado en `src/lib/api/client.ts`).
  - **NO uses Tailwind, Styled Components ni Emotion** (se usa exclusivamente CSS Modules con tokens CSS en `src/app/styles/`).
  - **NO uses gestores de estado externos como Redux, Zustand o MobX** (el estado global se gestiona mediante React Context modular en `src/app/providers/`).
  - **NO uses librerías de componentes externas como MUI, Chakra, AntD o Shadcn UI** (se utiliza el Design System propio en `src/components/ui/`).

---

## 2. Arquitectura de Carpetas: Bulletproof React (BPR)

El frontend sigue estrictamente la arquitectura **Bulletproof React**. La estructura de `src/` está organizada de la siguiente manera:

```text
src/
├── app/                  # Orquestación de la aplicación
│   ├── providers/        # Contextos globales (Auth, Cart, Config, Toast, etc.)
│   ├── router/           # AppRouter, PrivateRoute y gestión de historial
│   ├── routes/           # Componentes de ruta planos montados por el router
│   └── styles/           # Tokens CSS globales (tokens.css, reset.css, etc.)
├── assets/               # Imágenes estáticas y fuentes web
├── components/           # Componentes compartidos agnósticos al dominio
│   ├── layout/           # Shell global (Navbar, Footer, CategoriasNav, ShopLayout)
│   └── ui/               # Design System base (Button, Input, Modal, Table, etc.)
├── config/               # Configuración global de la app y territorios (GT/CL)
├── features/             # Módulos de dominio verticalmente integrados
│   ├── admin/            # Panel administrativo (productos, usuarios, órdenes)
│   ├── auth/             # Autenticación, login, registro y tokens
│   ├── branches/         # Sucursales físicas y retiro en tienda
│   ├── cart/             # Carrito, sincronización y expiración deslizante
│   ├── catalog/          # Catálogo, filtros, búsqueda y productos
│   ├── checkout/         # Pasos de pago (Webpay, QPayPro, Transferencia), orden y confirmación
│   ├── favorites/        # Lista de favoritos
│   ├── order/            # Detalle y seguimiento de pedidos
│   └── profile/          # Datos de usuario, direcciones de entrega y seguridad
├── hooks/                # Hooks utilitarios transversales (useEscapeKey, useClickOutside, etc.)
├── lib/                  # Infraestructura y clientes (cliente API, storage de tokens, validación)
├── test/                 # Infraestructura de pruebas (mocks de MSW, fixtures y setup)
└── utils/                # Utilidades puras (formato de moneda, fechas, URLs)
```

### Reglas Estrictas de Importación y Capas
- **PROHIBIDO reintroducir capas legacy de Feature-Sliced Design (FSD)**: No crees carpetas ni importes desde `src/pages/`, `src/widgets/`, `src/entities/` o `src/shared/`.
- **Path Aliases Válidos (`tsconfig.json`)**:
  - `@/*` -> `src/*`
  - `@/components/*` -> `src/components/*`
  - `@/features/*` -> `src/features/*`
  - `@/lib/*` -> `src/lib/*`
  - `@/utils/*` -> `src/utils/*`
  - `@/config/*` -> `src/config/*`
  - `@/hooks/*` -> `src/hooks/*`
  - `@/assets/*` -> `src/assets/*`
  - `@/app/*` -> `src/app/*`
- **Cohesión dentro de cada `feature`**:
  - Cada módulo en `src/features/<feature>/` encapsula su propia API (`api/`), componentes internos (`components/`), hooks (`hooks/`) y contratos de datos (`types/`).
  - La comunicación entre features se realiza únicamente a través de su API pública (`index.ts`). No importes archivos internos profundos de otra feature.
- **Capa `components/ui/` pura**:
  - Los componentes de `components/ui/` deben ser totalmente reutilizables y **agnósticos al dominio**; nunca deben importar desde `features/`.

---

## 3. Protección de Invariantes y Flujos Críticos de Negocio

Cualquier agente que modifique el frontend DEBE respetar los siguientes flujos de negocio sin introducir regresiones:

### 3.1. Autenticación de Doble Token (Access Token JWT + Cookie HttpOnly)
- El login (`POST /api/auth/login`) y refresco devuelven el token JWT en el body (`accessToken`), mientras que el Refresh Token viaja en una cookie `HttpOnly` gestionada por el navegador.
- El cliente HTTP en `src/lib/api/client.ts` intercepta errores `401 Unauthorized`. Si el access token expiró, invoca automáticamente a `/api/auth/refresh` y reintenta la petición original de forma transparente.
- Si el refresco falla, se limpia la sesión en memoria (`clearAuthTokens()`) y se redirige a login.

### 3.2. Multipaís y Multimoneda Dinámico (GT / CL)
- Los valores de moneda (`GTQ` / `CLP`), símbolo, cantidad de decimales (2 en Guatemala, 0 en Chile) y tasa de IVA se obtienen dinámicamente desde el backend mediante `GET /api/config` a través de `useConfig()`.
- **NUNCA hardcodees símbolos monetarios (`$`, `Q`), tasas de IVA ni cantidad de decimales** en los componentes. Utiliza siempre `formatCurrency()` de `@/utils/format`.

### 3.3. Ciclo de Vida del Carrito y Expiración Deslizante
- El carrito en backend tiene expiración deslizante al interactuar y expiración perezosa al consultar.
- Si el backend responde con HTTP `410 GONE` y código `"CARRITO_EXPIRADO"`, el frontend debe capturar el error y abrir el modal de restauración de carrito (`CartExpiredModal`), permitiendo al usuario revalidar stock y restaurar los ítems activos.

### 3.4. Checkout y Pasarelas de Pago
- **QPayPro (Guatemala)**: Redirige a pasarela cifrada o procesa formulario seguro para tarjetas locales e internacionales.
- **Webpay Plus (Chile)**: Requiere montos enteros sin decimales (`CLP`). El frontend procesa la redirección hacia Transbank y la confirmación en el retorno `/checkout/webpay-return`.
- **Snapshots inmutables**: El checkout envía selecciones de dirección o sucursal (`sucursalId` si es retiro en tienda con costo 0, o `direccionId` si es a domicilio).

---

## 4. Convenciones de Código y TypeScript

- **Idioma del dominio**: El dominio de negocio en backend y frontend (nombres de campos, estados, mensajes y endpoints) está en **español**. Mantén la coherencia semántica existente (`producto`, `orden`, `carrito`, `direccion`, `sucursal`).
- **TypeScript Estricto**:
  - Prohibido el uso de `any` (usar `unknown` con validación Zod o genéricos tipados).
  - Sufijo `Api` para tipos que representan contratos REST (`ProductApi`, `OrderApi`, `UserApi`).
  - Sufijo `Schema` para esquemas Zod (`productApiSchema`, `orderSchema`).
  - Sufijo `FormValues` para valores de formulario (`LoginFormValues`, `AddressFormValues`).
- **Validación con Zod**:
  - Toda respuesta de API externa o backend debe pasar por validación de esquemas Zod (`parseApi`) antes de llegar a los componentes de UI.
- **Evitar Dependencias Circulares**:
  - Al exportar componentes en barrels (`index.ts`), evita importar entre módulos hermanos a través del barrel para no generar advertencias de Rollup durante el build de producción (`pnpm run build`).

---

## 5. Reglas de Testing y Verificación Obligatoria

Antes de dar por concluida cualquier tarea en el frontend, el agente DEBE ejecutar y verificar:

1. **Chequeo de Tipos**:
   ```bash
   pnpm --dir frontend exec tsc --noEmit
   ```
   Debe terminar con **0 errores**.

2. **Compilación de Producción**:
   ```bash
   pnpm --dir frontend build
   ```
   Debe completar con éxito sin advertencias críticas de empaquetado.

3. **Pruebas Unitarias e Integración (Vitest)**:
   ```bash
   pnpm --dir frontend test
   ```
   - **Regla clave para mocks en Vitest**: Cuando un test requiera mockear un provider o hook global (como `useCheckout`, `useAuth`, `useConfig`), **mockea directamente el módulo de origen** (ej: `vi.mock('@/app/providers/useCheckout', ...)`) en lugar de mockear el barrel `@/app/providers`, para evitar discrepancias de resolución en el entorno ESM de Vitest.
