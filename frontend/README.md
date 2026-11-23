# JEPLabs E-Commerce — Frontend

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white&style=flat-square)
![Node](https://img.shields.io/badge/Node.js-24.22_LTS-339933?logo=nodedotjs&logoColor=white&style=flat-square)
![pnpm](https://img.shields.io/badge/pnpm-10.33-F69220?logo=pnpm&logoColor=white&style=flat-square)
![Architecture](https://img.shields.io/badge/Architecture-Bulletproof_React-000000?style=flat-square)
![Vitest](https://img.shields.io/badge/Tests-Vitest_4-6E9F18?logo=vitest&logoColor=white&style=flat-square)
![Cypress](https://img.shields.io/badge/E2E-Cypress_15-17202C?logo=cypress&logoColor=white&style=flat-square)

Single Page Application (SPA) para la plataforma **JEPLabs E-Commerce**, construida sobre **React 19**, **TypeScript**, **Vite 7** y la arquitectura **Bulletproof React (BPR)**. Consume la API REST en Spring Boot 4 (Java 21) y soporta operativa multimoneda y multipaís (Guatemala `GTQ` y Chile `CLP`).

---

## Inicio Rápido

### Requisitos Previos y Entorno Seguro
- **Node.js**: v24.22.x LTS (versión probada y recomendada; compatible con Node v20.x+ LTS).
- **pnpm**: v10.x / v9.x (`npm install -g pnpm`).
- **Backend API**: Spring Boot 4.0.3 (Java 21) en ejecución en `http://localhost:8080` (opcional en desarrollo al usar MSW).

### Instalación y Ejecución

```bash
# 1. Navegar al directorio del frontend
cd frontend

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno (opcional en desarrollo local)
cp .env.example .env.local

# 4. Iniciar servidor de desarrollo (HMR en http://localhost:5173)
pnpm run dev
```

---

## Variables de Entorno

Crear un archivo `.env.local` en la raíz de `frontend/` para configurar o sobrescribir parámetros locales:

```env
# URL base de la API REST del backend Spring Boot
VITE_API_URL=http://localhost:8080

# Cloudinary (carga de imágenes para catálogo desde panel Admin)
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
```

---

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm run dev` | Inicia el servidor de desarrollo local con Vite (puerto 5173). |
| `pnpm run build` | Chequeo de tipos estricto y compilación optimizada en `dist/`. |
| `pnpm run preview` | Previsualiza localmente el build de producción generado. |
| `pnpm run lint` | Ejecuta ESLint 9 con reglas estrictas de TypeScript y React Hooks. |
| `pnpm test` | Ejecuta la suite de pruebas unitarias y de integración con Vitest. |
| `pnpm run test:watch` | Modo interactivo continuo para pruebas unitarias. |
| `pnpm run test:coverage`| Genera reporte de cobertura de código con Vitest. |
| `pnpm run test:e2e` | Ejecuta tests E2E con Cypress en modo headless. |
| `pnpm run cypress:open` | Abre la interfaz gráfica interactiva de Cypress. |

---

## Arquitectura del Proyecto (Bulletproof React)

La aplicación sigue los principios de **Bulletproof React**, organizando el código por dominios de negocio autónomos y desacoplados:

```text
src/
├── app/                  # Orquestación global: AppRouter, providers, estilos base
│   ├── providers/        # Contextos globales (Auth, Cart, Config, Toast, etc.)
│   ├── router/           # Configuración de rutas (AppRouter, PrivateRoute)
│   ├── routes/           # Componentes de ruta planos (Home, Catalog, Checkout, Admin, etc.)
│   └── styles/           # Tokens CSS globales, reset y temas
├── assets/               # Fuentes web optimizadas e imágenes estáticas
├── components/           # Componentes compartidos agnósticos al dominio
│   ├── layout/           # Shell común (Navbar, Footer, CategoriasNav)
│   └── ui/               # Design System base (Button, Input, Modal, Table, etc.)
├── config/               # Configuración de la app y territorios (GT/CL)
├── features/             # Módulos de dominio verticalmente integrados
│   ├── admin/            # CRUD productos, pedidos y usuarios
│   ├── auth/             # Login, registro, recuperación y gestión de sesión
│   ├── branches/         # Sucursales físicas y retiro en tienda
│   ├── cart/             # Carrito, sincronización y expiración deslizante
│   ├── catalog/          # Lista de productos, filtros y búsqueda
│   ├── checkout/         # Pasos de pago (QPayPro, Webpay, Transferencia), orden y confirmación
│   ├── favorites/        # Lista de deseos del usuario
│   ├── order/            # Detalle y seguimiento de compras
│   └── profile/          # Datos de usuario, direcciones de entrega y seguridad
├── hooks/                # Hooks utilitarios transversales (useEscapeKey, useClickOutside, etc.)
├── lib/                  # Clientes e infraestructura (cliente API, tokens, validación Zod)
├── test/                 # Configuración de pruebas, mocks y servidor MSW
└── utils/                # Funciones puras (formateadores de moneda, fechas, URLs)
```

### Reglas de Organización
1. **Cohesión por Feature (`src/features/<feature>/`)**: Cada dominio encapsula su propia API (`api/`), componentes internos (`components/`), hooks de negocio (`hooks/`) y tipos (`types/`).
2. **API Pública Limpia (`index.ts`)**: Cada feature expone solo lo que otros módulos necesitan consumir.
3. **Capa `components/ui/`**: Solo contiene controles reutilizables agnósticos de negocio (botones, inputs, modales, alertas). No importa nada desde `features/`.
4. **Rutas Ligeras (`src/app/routes/`)**: Las rutas se cargan con `React.lazy()` (code-splitting) y solo conectan parámetros de URL con las features correspondientes.

---

## Patrones Críticos de Negocio

- **Autenticación de Doble Token**: Access Token JWT en memoria y Refresh Token seguro en cookie `HttpOnly`. Interceptores en `lib/` gestionan la rotación automática y reintento transparente ante respuestas `401`.
- **Multimoneda y Multipaís**: La configuración de moneda (`GTQ` con 2 decimales para Guatemala; `CLP` con 0 decimales para Chile) e IVA se obtienen dinámicamente desde el backend (`GET /api/config`). Nunca hardcodear símbolos ni decimales.
- **Carrito y Expiración**: Manejo de expiración deslizante y respuesta a status `410 GONE` (`CARRITO_EXPIRADO`) con modal de restauración de stock.
- **Validación en el Borde**: Todo consumo de endpoints REST valida el payload con esquemas **Zod** antes de pasar a los componentes de UI.

---

## Estrategia de Pruebas

- **Pruebas Unitarias y de Integración (Vitest + RTL + MSW)**: Interceptan llamadas de red con Mock Service Worker (MSW), permitiendo probar flujos complejos de checkout, autenticación y catálogo sin depender del backend activo.
- **Pruebas de Extremo a Extremo (Cypress)**: Verifican flujos de usuario reales en navegador (compra completa, filtros, navegación protegida).
