# Reglas Generales del Repositorio — JEPLabs E-Commerce

Este repositorio contiene un monorepo para la plataforma **JEPLabs E-Commerce**, compuesto por un backend REST en **Spring Boot 4.0.3 (Java 21)** y un frontend SPA en **React 19 + TypeScript 6 + Vite 7**.

## 1. Mapa General del Proyecto

- **`/backend`**: API RESTful en Java 21 con Spring Boot 4.0.3, Spring Security (JWT + Refresh Token Cookie HttpOnly), Spring Data JPA (Hibernate), PostgreSQL y migraciones con Flyway.
  - Paquete base: `com.jeplabs.ecommerce` (Nota: en `pom.xml` el `groupId` es `com.jpelabs`, pero toda la estructura de paquetes Java es `com.jeplabs.ecommerce`).
  - Documentación técnica de decisiones e integraciones en `/backend/docs/`.
  - Reglas específicas de backend en `./backend/AGENTS.md`.
- **`/frontend`**: Single Page Application (SPA) en React 19.2, TypeScript 6.0, Vite 7.3, React Router 7, React Hook Form + Zod 4.4 y CSS Modules.
  - Arquitectura: **Feature-Sliced Design (FSD)** estricta en `src/` (`app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`).
  - Gestor de paquetes: **`pnpm`** (`pnpm install`, `pnpm run dev`, `pnpm test`, `pnpm run cypress:run`).
- **`/netlify.toml`**: Configuración de despliegue del frontend y cabeceras HTTP de seguridad (CSP, HSTS, X-Frame-Options).

## 2. Configuración Multipaís y Multimoneda (GT / CL)

El sistema opera con perfiles combinados de entorno y país (`spring.profiles.active=dev,gt` o `dev,cl`):
- **Guatemala (`gt`)**: Moneda `GTQ` (`Q`), 2 decimales, IVA `12%` (`0.12`), pasarela local **QPayPro**.
- **Chile (`cl`)**: Moneda `CLP` (`$`), **0 decimales** (enteros estrictos), IVA `19%` (`0.19`), pasarela local **Transbank Webpay Plus**.
- El endpoint público `GET /api/config` expone la configuración activa de país, moneda, decimales, IVA y umbral de envío gratis al frontend. Nunca hardcodees símbolos de moneda, tasas de IVA ni cantidad de decimales en el código.

## 3. Protección de Flujos Críticos de Negocio (Invariantes)

Cualquier modificación en el repositorio DEBE preservar intactos los siguientes flujos críticos:

### 3.1. Autenticación de Doble Token (Access JWT + Refresh Cookie HttpOnly)
- El login (`POST /api/auth/login`) y la renovación (`POST /api/auth/refresh`) devuelven un **Access Token JWT** de corta duración en el body (`DatosRespuestaToken`) y emiten un **Refresh Token** opaco en una cookie `HttpOnly` (`path=/api/auth`) gestionada por `RefreshCookieHelper`.
- `RefreshTokenService` almacena únicamente el hash SHA-256 (`token_hash`) en BD, agrupa tokens por `family_id`, rota el token en cada refresh y **revoca toda la familia** si detecta reutilización de un token ya rotado.
- El bloqueo temporal por fuerza bruta (`LoginAttemptService` / `lockout-minutes`) y la prevención de auto-desactivación de cuentas ADMIN en `AutenticacionService` no deben eliminarse.

### 3.2. Ciclo de Vida y Expiración del Carrito (`CarritoService` / `CarritoScheduler`)
- Un usuario tiene como máximo un carrito en estado `ACTIVO`.
- El carrito implementa **expiración deslizante (sliding expiration)** al interactuar, **expiración perezosa (lazy expiration)** al consultarse o hacer checkout (lanzando `CarritoExpiradoException` -> HTTP `410 GONE` con `"codigo": "CARRITO_EXPIRADO"`), y expiración en segundo plano mediante `CarritoScheduler`.
- Permite restaurar carritos expirados (`POST /api/carrito/restaurar`) validando disponibilidad y stock actual de cada ítem.

### 3.3. Checkout, Creación de Órdenes y Control de Stock (`OrdenService`)
- Crear una orden (`POST /api/ordenes`) convierte el carrito `ACTIVO` a `COMPLETADO`, descuenta el stock de cada `Producto` (protegido con bloqueo optimista `@Version`) y actualiza automáticamente el estado del producto entre `DISPONIBLE` y `SIN_STOCK`.
- **Snapshots inmutables**: La tabla `ordenes` guarda una copia textual inmutable de la dirección de entrega o de la sucursal de retiro (`direccion_alias`, `direccion_calle`, `sucursal_horario`, etc.), y `orden_items` congela `sku`, `nombre_producto`, `precio_unitario`, `precio_base` e `iva_unitario`. Nunca reemplaces estos snapshots por lecturas dinámicas de entidades mutables.
- **Reglas de Envío**:
  - Si `servicioEnvio.esRetiroEnTienda()` es `true`, se exige `sucursalId` activa, el costo de envío es `0` y `direccionId` queda `null`.
  - Si es envío a domicilio, se exige `direccionId` perteneciente al usuario autenticado.
  - Servicios express con `sinContraEntrega = true` rechazan `FormaPagoEnvio.CONTRA_ENTREGA`.
- **Cancelación y Expiración**: Cancelar una orden (`PENDIENTE` o `CONFIRMADA`) o expirarla automáticamente (`OrdenExpiracionScheduler`) **debe devolver el stock** a los productos correspondientes (`producto.devolverStock()`).

### 3.4. Pasarelas de Pago y Prevención de Fugas 401 (`WebpayService`, `QPayProService`, `GestorDeErrores`)
- **Webpay Plus (Chile)**:
  - Transbank exige montos enteros sin decimales para `CLP` (`setScale(0, RoundingMode.HALF_UP)`). Enviar decimales provoca rechazo HTTP 400 en Transbank.
  - Antes de expirar o recrear una transacción `INICIADA` con más de 10 minutos, se debe consultar el estado real en Transbank (`verificarYActualizarEstadoTransaccion`) e invocar el reconciliador (`WebpayReconciliacionScheduler`) para evitar cobros duplicados.
- **QPayPro (Guatemala)**:
  - Solo opera cuando la moneda no es `CLP`.
  - Requiere sanitización estricta de campos para CyberSource (teléfono numérico >= 8 dígitos, código de país ISO de 2 letras en mayúsculas, matriz `x_line_item` sincronizada con los ítems de la orden).
- **Webhooks y Retornos Públicos**:
  - Las rutas `/api/pagos/webpay/confirmar`, `/api/pagos/webpay/webhook`, `/api/pagos/webpay/estado/**`, `/api/pagos/qpaypro/retorno` y `/api/pagos/qpaypro/estado/**` deben permanecer públicas en `SecurityConfigurations` porque son invocadas por las pasarelas o retornos sin cabecera `Authorization`.
- **Aislamiento de Errores de Pasarela (`GestorDeErrores`)**:
  - Cualquier `RestClientResponseException` (incluyendo un `401 Unauthorized` devuelto por QPayPro o Webpay por credenciales de comercio) es interceptado y transformado en **HTTP `502 BAD_GATEWAY`**. Nunca dejes escapar un `401` de una API externa hacia el frontend, ya que el interceptor del cliente interpretaría que la sesión JWT del usuario expiró y cerraría su sesión durante el checkout.

## 4. Reglas Operativas para Agentes
- **Idioma del dominio y código**: El dominio de negocio en backend (clases, métodos, campos de BD, endpoints y mensajes de error) está en **español**. Mantén la nomenclatura existente.
- **No inventar dependencias**: Verifica siempre `backend/pom.xml` y `frontend/package.json` antes de importar cualquier librería.
- **Seguridad de credenciales**: Nunca escribas secretos reales en `application.properties` ni comitees `application-dev.properties` o `.env.local`.
