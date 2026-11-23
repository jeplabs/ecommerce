# Plan: WebPay Plus (Transbank) — Implementación Frontend

> Documento detallado del frontend. Para el plan general de ambas pasarelas (backend + frontend) ver [`PLAN_PASARELAS.md`](./PLAN_PASARELAS.md).
> Depende del contrato de backend definido en la sección [Paso 0](#paso-0--acordar-el-contrato-api-con-el-equipo).

## Cómo funciona WebPay Plus (lo que el frontend debe cumplir)

1. El backend llama a Transbank `create` → recibe **`url` + `token`**.
2. El frontend **redirige al usuario con un formulario POST** (campo oculto `token_ws`) a esa `url`. **No usar iframe** (lo desaconseja Transbank).
3. El usuario paga en la página de Webpay.
4. Transbank devuelve al navegador a tu `returnUrl` con `?token_ws=...` (GET en API 1.1+; en integración, el caso "abortado" llega por POST).
5. El frontend le pasa ese `token_ws` al backend, que llama a `commit(token_ws)`.
6. Pago aprobado solo si `response_code == 0` y `status == AUTHORIZED`.

**Datos de prueba (ambiente integración):** tarjeta **VISA 4051885600446623**, CVV **123**, expiración futura cualquiera; auth bancaria RUT **11.111.111-1** / clave **123**. El token caduca a los **5 minutos**. `buy_order` máx. 26 caracteres alfanuméricos.

---

## Roles: quién habla con quién (despeja la confusión frontend / backend / Transbank)

Hay **tres tipos de comunicación** distintos en este flujo:

**A) Llamadas API server-to-server (backend Java → Transbank).** Usan credenciales (Commerce Code + API Key) y las hace **solo el backend**:

```
Backend ── create(buyOrder, monto, returnUrl) ──▶ Transbank     [con credenciales]
Backend ◀── { url, token } ────────────────────── Transbank
Backend ── commit(token_ws) ─────────────────────▶ Transbank     [con credenciales]
Backend ◀── { responseCode, authorizationCode } ── Transbank
```

**B) Llamadas frontend → backend.** El frontend habla con **tu propia API**, no con Transbank. Son llamadas HTTP normales a `POST /api/ordenes` y `POST /api/pagos/webpay/*`, igual que cualquier otro endpoint de la app.

**C) Navegación del navegador (Transbank ↔ usuario).** No es una llamada de API: el navegador "viaja" a la página de Transbank con un form POST (llevando `token_ws`) y vuelve por un redirect a la `returnUrl`.

**Puntos clave:**
- El `token` **no es una credencial**: es el número de ticket de la transacción. Transbank se lo entrega al comercio para redirigir al usuario y después recuperar el resultado. Sin las credenciales (que solo tiene el backend) el token no sirve para cobrar nada.
- El frontend **nunca toca credenciales**. Su rol completo: recibe `{ url, token }` del backend, redirige al usuario con un form, y retransmite el `token_ws` de vuelta al backend para que este confirme.
- El backend es el único que puede crear y confirmar la transacción, porque es quien posee las llaves. El frontend es el "mensajero" entre el navegador del usuario y tu API.

---

## Contexto actual del frontend (lo que hay que reemplazar)

- El pago se **simula 100% en el navegador** (`features/checkout/api/paymentApi.ts` → `processPayment`), que genera IDs ficticios sin llamar a ningún servidor.
- `completeCheckout` (`features/checkout/model/useCheckoutLogic.ts:268`) simula el pago y **después** crea la orden con `POST /api/ordenes`.
- El botón **Webpay Plus ya existe** en `PaymentStep.tsx` (líneas 80-93), pero renderiza `SimulatedWebpayForm` (componente estático).
- `canContinuePayment` ya retorna `true` para `PAYMENT_METHODS.WEBPAY` (línea 239) — no requiere cambios.
- `OrderConfirmationSummary` ya muestra `payment.provider` / `payment.transactionId` / `payment.authorizationCode`.

---

## Flujo conceptual del pago (con fundamentos de cada decisión)

```
Fase A  Usuario elige Webpay Plus                  (frontend)
Fase B  Se crea la orden PENDIENTE                  (frontend → backend)
Fase C  Se inicia la transacción                    (frontend → backend → Transbank)
Fase D  Redirección al formulario de Webpay         (frontend → Transbank)
Fase E  Hosted checkout (tarjeta, auth bancaria)    (Transbank ↔ usuario)
Fase F  Retorno al comercio con resultado           (Transbank → frontend)
Fase G  Confirmación server-to-server               (frontend → backend → Transbank)
Fase H  Éxito: voucher + carrito limpio             (frontend)
```

### Fase A — El usuario elige Webpay (frontend)

El cliente llega al paso de pago y selecciona **Webpay Plus**.

**Fundamento:** WebPay Plus es una pasarela *redirect-based*: el pago no se hace en el sitio del comercio, sino en la página de Transbank. Por eso este método **no requiere datos de tarjeta en el frontend** — ni número, ni CVV, ni vencimiento. La UI solo pide "ir a pagar".

Beneficio: **el servidor nunca toca datos de tarjeta** (PCI-DSS sin certificación propia). La captura del dato bancario es 100% responsabilidad de Transbank.

### Fase B — Se crea la orden (frontend → backend)

Antes de redirigir a Webpay, el frontend crea la orden en el backend en estado **`PENDIENTE`**.

**Fundamentos:**

1. **Se necesita un identificador de orden antes de pagar.** Transbank pide un `buy_order` (máx. 26 caracteres alfanuméricos) que es el ID con el que se cruza la transacción al volver. Usar el `id` de la orden como base del `buy_order` es lo más limpio: único, trazable, sin colisiones.
2. **La orden como "intención de compra".** Queda registrada aunque el pago no se confirme aún. Permite:
   - Reintentar el pago si el usuario se arrepiente o el pago falla.
   - Ver en el panel de admin las órdenes "iniciadas pero sin pagar".
   - Un job que expire órdenes `PENDIENTE` abandonadas (devolviendo stock). **Fase 2:** el TTL de `PENDIENTE` debe diseñarse considerando todos los métodos (transferencia, contraentrega, pasarela), no solo Webpay.
3. **El monto se fija al crear la orden.** El backend guarda `subtotal`, `iva`, `costoEnvio`, `total` en ese momento. Esa es la cifra que se cobra — **nunca la que diga el frontend** al volver.

Reutiliza el endpoint existente `POST /api/ordenes`; solo cambia el estado de nacimiento de la orden (`PENDIENTE` en vez de confirmada).

### Fase C — Se inicia la transacción (frontend → backend → Transbank)

El frontend llama a un endpoint nuevo del backend tipo `POST /api/pagos/pasarela/iniciar` con `ordenId` y `returnUrl`.

**El frontend NO habla con Transbank directamente. Todo pasa por el backend.**

**Fundamentos:**

1. **Credenciales.** El `API Key` y el `Commerce Code` son secretos que viven solo en el servidor. Si el frontend llamara a Transbank, las llaves quedarían expuestas en el navegador.
2. **El backend invoca `create` de Transbank** con `buyOrder`, `sessionId`, `amount` (total de la orden en **CLP entero**) y `returnUrl`.
3. **Transbank responde `url` + `token`.** El token es el "boleto" de la transacción: caduca en 5 minutos. Con él se redirige al usuario y después se confirma.
4. **El backend persiste la transacción** (tabla `pagos`): proveedor, token, orden, monto, estado `INICIADO`. Permite cruzar el retorno con la orden correcta y validar montos.

### Fase D — Redirección (frontend → Transbank)

El frontend recibe `url` + `token` y redirige al usuario.

**Fundamento técnico:** Transbank exige que la redirección sea un **formulario POST con campo oculto `token_ws`** cuyo valor es el token y cuyo `action` es la URL de Webpay. No es un link común ni un redirect de `window.location`. No usar iframe (el formulario de pago puede no desplegarse).

Se renderiza un form invisible con auto-submit y una pantalla de transición "Redirigiendo a Webpay Plus…".

### Fase E — Hosted checkout (Transbank ↔ usuario)

La comunicación es entre el navegador del usuario y Transbank. El comercio **no participa**.

El formulario tiene tiempo límite: **4 minutos en producción, 10 en integración**. Si se excede, la transacción se aborta sola.

**Fundamento:** acá está el corazón de la seguridad — los datos bancarios nunca pasan por la infraestructura del comercio. No se puede ni se debe interferir.

### Fase F — Retorno (Transbank → frontend)

Cuando termina (éxito, rechazo, abandono o timeout), Transbank redirige el navegador a la `returnUrl`. **El frontend recibe parámetros distintos según el caso:**

| Caso | Parámetros recibidos | Acción |
|---|---|---|
| **Pago completado** (aprobado o rechazado) | `token_ws` (GET en API 1.1+) | Confirmar (Fase G) |
| **Pago abortado** (botón "Anular compra") | `TBK_TOKEN` + `TBK_ORDEN_COMPRA` + `TBK_ID_SESION` | Mostrar "no completado", no confirmar |
| **Timeout** (se acabó el tiempo) | solo `TBK_ORDEN_COMPRA` + `TBK_ID_SESION`, **sin token** | Mostrar "se excedió el tiempo" |
| **Error de formulario** (caso borde) | `token_ws` + `TBK_TOKEN` + `TBK_ID_SESION` + `TBK_ORDEN_COMPRA` | Confirmar y/o mostrar error |

**Fundamento de diseño:** se necesita una **página de retorno dedicada** (`/checkout/retorno`) porque es el punto de entrada de un flujo externo: llegan query params por GET que no pasan por el checkout normal. Esa página:
- Lee qué parámetros llegaron y clasifica el caso.
- Si hay `token_ws`, llama al confirm (Fase G).
- Si es abort/timeout, muestra el mensaje correspondiente y NO intenta confirmar.

### Fase G — Confirmación (frontend → backend → Transbank)

El frontend envía el `token_ws` al backend (`POST /api/pagos/pasarela/webpay/confirmar`). El backend llama a `commit(token_ws)` y valida.

**Fundamentos — los más importantes del flujo:**

1. **Nunca confiar en el retorno del navegador.** Cualquiera podría entrar a `/checkout/retorno` con un `token_ws` inventado o reutilizado. La confirmación debe ser **server-to-server**: el backend pregunta a Transbank "¿qué pasó con este token?" y Transbank responde el resultado real (monto, buyOrder, `response_code`, `status`).
2. **Validaciones del backend antes de dar por pagada la orden:**
   - `response_code == 0` y `status == AUTHORIZED`.
   - El `buyOrder` de la respuesta coincide con una orden `PENDIENTE` propia.
   - El **monto** devuelto por Transbank coincide con el total guardado en la orden (anti-manipulación: un atacante no puede pagar $1 por un pedido de $100).
   - La transacción estaba en `INICIADO` (idempotencia: si ya se confirmó, devolver el mismo resultado en vez de cobrar dos veces).
3. **Transición de estados:** transacción `INICIADO → AUTORIZADO`, orden `PENDIENTE → CONFIRMADA`. Se guarda el `código de autorización` de Transbank (se muestra en el voucher).
4. **El backend responde al frontend** con la orden confirmada + datos del pago (transactionId / autorización).

### Fase H — Éxito (frontend)

Con la respuesta del confirm, el frontend navega a `/checkout/success`, refresca/limpia el carrito y muestra el voucher con el `authorizationCode` de Transbank.

**Fundamento:** se reutiliza la pantalla de éxito existente (`OrderConfirmationSummary` ya renderiza `provider`, `transactionId`, `authorizationCode`).

---

## Plan paso a paso (frontend)

### Paso 0 — Acordar el contrato API con el equipo

Propuesta de endpoints que el backend debe exponer:

```
POST /api/pagos/pasarela/iniciar
  body: { metodoPagoCodigo: 'WEBPAY', ordenId: number, returnUrl: string }
  resp: { urlRedireccion: string, token: string }

POST /api/pagos/pasarela/webpay/confirmar
  body: { token_ws: string }
  resp: { success: true, orden: OrderApi, payment: { transactionId, authorizationCode, amount } }
        | { success: false, error: string, motivo: 'ABORTED' | 'TIMEOUT' | 'REJECTED' }
```

**Acordado con el equipo:**
- El `confirmar` **devuelve la `OrderApi` completa ya confirmada + datos del pago** en la misma respuesta. El frontend navega a `/checkout/success` directamente con esos datos. **No se necesita ningún GET adicional** (el plan del backend proponía devolver solo campos crudos de Transbank, lo que habría obligado a un GET extra).
- Los `motivo` de fallo (`ABORTED` / `TIMEOUT` / `REJECTED`) permiten que el frontend muestre el mensaje correcto.
- **Idempotencia desde la base:** si la transacción ya está confirmada, `confirmar` devuelve el mismo resultado exitoso en lugar de un error (ver [Paso 6](#paso-6--idempotencia-guard-anti-doble-clic-parte-del-camino-feliz)).

**Decisión de arquitectura (recomendada):** crear la orden ANTES de redirigir:
1. Frontend hace `POST /api/ordenes` (orden queda `PENDIENTE`) → obtiene `orden.id`.
2. Frontend llama a `iniciar` con ese `ordenId` → el backend usa `buyOrder` basado en la orden.
3. Al confirmar, el backend pasa la orden a `CONFIRMADA`.

**`returnUrl`:** debe ser una URL **pública** (Webpay la alcanza desde internet). Dev: `https://<host-ngrok>/checkout/retorno?proveedor=webpay`. Prod: el dominio real.

### Paso 1 — Tipos y schemas (`features/checkout/model/schemas/payment.ts`)

- Nuevo tipo `PaymentInitResult` (`{ urlRedireccion, token }`) con su schema zod.
- Nuevo schema de confirm para Webpay (reutilizar `paymentSuccessResultSchema` que ya existe en línea 41, y el schema de fallo).
- Exportar los tipos nuevos.

### Paso 2 — Nueva capa API (`features/checkout/api/paymentGatewayApi.ts`)

Crear un módulo nuevo que siga el patrón de `entities/order/api/orderApi.ts` (imports: `API_URL` de `@/shared/config`, `getAuthHeaders`, `parseApi`, `ApiError`):

- `iniciarPasarela({ ordenId, returnUrl })` → `POST /api/pagos/pasarela/iniciar`.
- `confirmarWebpay(token_ws)` → `POST /api/pagos/pasarela/webpay/confirmar`.

El frontend no necesita el `token` para redirigir (se manda en el form), pero sí para mostrar referencia si se quiere.

### Paso 3 — Flujo de inicio en `completeCheckout` (`features/checkout/model/useCheckoutLogic.ts:268`)

- Extender `CheckoutCompleteResult` con un caso de redirección:
  `{ success: true, needsRedirect: true, urlRedireccion: string, orden: OrderApi }`.
- Rama para `paymentMethod === PAYMENT_METHODS.WEBPAY`:
  1. Crear la orden con `metodoPagoCodigo: 'WEBPAY'` (lógica existente líneas 316-322).
  2. `iniciarPasarela({ ordenId: orden.id, returnUrl })`.
  3. Marcar `checkoutCompletedRef.current = true` y retornar `{ success: true, needsRedirect: true, urlRedireccion, orden }`.
  4. **No navegar a `/checkout/success` todavía** — el éxito depende del confirm.
- Para métodos no pasarela, mantener el flujo actual.

**Decisión (acordada):** el carrito se consume al crear la orden (comportamiento actual: `refreshCart()` después de crear la orden). Si el pago falla, la orden queda `PENDIENTE`/`CANCELADA` y el usuario genera un pedido nuevo.

### Paso 4 — Componente de redirección (`features/checkout/ui/RedirectToWebpay/RedirectToWebpay.tsx`)

- Renderiza un `<form method="POST" action={url}>` con `<input type="hidden" name="token_ws" value={token} />`.
- Auto-submit en `useEffect` y mensaje "Redirigiendo a Webpay Plus…".

### Paso 5 — Página de retorno `/checkout/retorno`

- **Ruta** en `app/router/AppRouter.tsx` (junto a las líneas 73-89, dentro de `PrivateRoute` `ROLE_CUSTOMER`): `/checkout/retorno`.
- **Página** `pages/checkout/ui/CheckoutReturnPage.tsx` + vista `features/checkout/ui/CheckoutReturn/CheckoutReturn.tsx`:
  - Leer query string: `token_ws`, `TBK_TOKEN`, `TBK_ORDEN_COMPRA`, `TBK_ID_SESION`.
  - Caso normal (`token_ws`): llamar `confirmarWebpay(token_ws)` en `useEffect` con estado de carga.
  - Caso abortado (`TBK_TOKEN` sin `token_ws`): mostrar "El pago no se completó" (no confirmar).
  - Caso timeout (solo `TBK_ORDEN_COMPRA`/`TBK_ID_SESION`): mostrar "Se excedió el tiempo en Webpay".
  - En integración, el retorno abortado puede llegar por POST — documentarlo; en producción es GET.
- **Éxito:** `navigate('/checkout/success', { replace: true, state: { orden, payment, isBankTransfer: false } })` y llamar `refreshCart()`.

### Paso 6 — Idempotencia: guard anti doble clic (parte del camino feliz)

**Por qué es parte del camino feliz:** la página de retorno hace auto-submit del confirm al montar. Si el usuario **refresca (F5)** esa página, se envía un segundo POST con el mismo `token_ws`. Transbank solo acepta el primer `commit`; el segundo falla. Sin protección, el frontend mostraría un error sobre un pago que **sí** se hizo.

**Frontend — guard anti doble clic:**
- En `CheckoutReturn`: un `ref`/flag que impida lanzar `confirmarWebpay` más de una vez por montaje (importante también porque React StrictMode monta los componentes 2 veces en dev).
- En `handlePay` (`CheckoutContent`): reutilizar el `payingRef` que ya existe (línea 19) para que "Pagar" no dispare dos `iniciar` encadenados (crear la orden + iniciar es un par atómico).
- No "bloquear" al usuario: si ya se está confirmando, ignorar el segundo intento en silencio, no mostrar un error.

**Backend — idempotencia del confirm:**
- Antes de llamar a `commit(token_ws)`, verificar el estado de la transacción en la tabla `webpay_transacciones`:
  - Si ya está `APROBADA` → devolver el mismo resultado exitoso (orden + payment) que se guardó la primera vez, **sin llamar de nuevo a Transbank**.
  - Si está `INICIADA` → proceder con `commit`.
  - Si está en un estado terminal de rechazo → devolver ese resultado de rechazo.
- Esto convierte el doble POST en un caso inofensivo.

### Paso 7 — `handlePay` en `features/checkout/ui/CheckoutContent/CheckoutContent.tsx:57`

- Si `completeCheckout` retorna `needsRedirect`, NO navegar a success; renderizar `RedirectToWebpay` con la URL del resultado.
- Guardar el estado de redirección en el hook (p. ej. `redirectInfo` en `useCheckoutLogic`) y renderizarlo desde `PaymentStep` o `CheckoutContent`.

### Paso 8 — UI (`features/checkout/ui/PaymentStep/PaymentStep.tsx`)

- Dejar el botón Webpay (líneas 80-93) como está.
- Reemplazar `SimulatedWebpayForm` (línea 134) por un resumen "Serás redirigido a Webpay Plus para completar el pago" + el `RedirectToWebpay`.
- Actualizar el subtítulo (línea 32: "El pago es simulado…") para reflejar la redirección real.
- Etiqueta del botón de pago en `CheckoutContent.tsx:148-152`: "Pagar con Webpay" cuando `paymentMethod === WEBPAY`.
- `canContinuePayment` ya cubre WEBPAY — sin cambios.

### Paso 9 — `OrderConfirmationSummary`

- Verificar que el `authorizationCode` devuelto por el confirm real llegue a la pantalla de éxito. Probablemente sin cambios.

### Paso 10 — Tests

- **`useCheckoutLogic.test.tsx`**: mockear `paymentGatewayApi.iniciarPasarela`; para WEBPAY, assert que `completeCheckout` retorna `{ success: true, needsRedirect: true, urlRedireccion }` y que llama `crearOrden` con `metodoPagoCodigo: 'WEBPAY'`.
- **MSW**: fixtures para `POST /api/pagos/pasarela/iniciar` y `.../confirmar` (éxito con `response_code 0`).
- **Nuevo test de `CheckoutReturn`**: con `token_ws` ok → navega a `/checkout/success`; con `TBK_TOKEN` → muestra "no completado".

---

## Archivos a crear / tocar (resumen)

**Crear:**

| Archivo | Rol |
|---|---|
| `features/checkout/api/paymentGatewayApi.ts` | Llamadas HTTP a `iniciar` / `confirmar` |
| `features/checkout/ui/RedirectToWebpay/RedirectToWebpay.tsx` | Form POST auto-submit a Webpay |
| `features/checkout/ui/CheckoutReturn/CheckoutReturn.tsx` | Manejo del retorno (4 casos) + confirm |
| `pages/checkout/ui/CheckoutReturnPage.tsx` | Página de retorno (+ export en barrel) |

**Tocar:**

| Archivo | Cambio |
|---|---|
| `features/checkout/model/schemas/payment.ts` | Tipos `PaymentInitResult` / confirm Webpay |
| `features/checkout/model/useCheckoutLogic.ts` | Rama WEBPAY en `completeCheckout` + `redirectInfo` |
| `features/checkout/ui/CheckoutContent/CheckoutContent.tsx` | `handlePay`, botón, render del redirect |
| `features/checkout/ui/PaymentStep/PaymentStep.tsx` | Quitar form simulado, textos |
| `app/router/AppRouter.tsx` | Ruta `/checkout/retorno` |
| Tests `useCheckoutLogic.test.tsx` + MSW fixtures | Cobertura del nuevo flujo |

---

## Buenas prácticas de fondo

| Práctica | Por qué |
|---|---|
| **Todo contra Transbank desde el backend** | Las credenciales no pueden vivir en el navegador; el monto se valida del lado servidor |
| **Crear la orden `PENDIENTE` antes de redirigir** | Necesitás `buyOrder` + orden trazable + soporte de reintento |
| **Confirmar server-to-server con `commit`** | El retorno del navegador es falsificable; la validación real la hace el backend contra Transbank |
| **`confirmar` devuelve la orden completa** | Elimina el GET extra hacia la pantalla de success (un solo round-trip) |
| **Idempotencia en `confirmar`** | Un refresh de la página de retorno reenvía el POST; no debe doblar el cobro ni mostrar error sobre un pago exitoso |
| **Validar monto + buyOrder + estado de la transacción** | Anti-manipulación e idempotencia (evita cobros dobles) |
| **Persistir la transacción (`pagos`)** | Cruzás el retorno con la orden y tenés auditoría |
| **El frontend nunca captura tarjeta** | PCI-DSS; el dato bancario queda solo en Transbank |
| **Página de retorno dedicada con manejo de los 4 casos** | GET externo con params distintos según abort/timeout/éxito |
| **`returnUrl` pública (ngrok en dev)** | Transbank necesita alcanzar tu servidor desde internet |
| **Redirigir en la misma pestaña** | Flujo lineal sin estados duplicados; una pestaña nueva deja el checkout original desincronizado |
| **Webhook de Transbank (fase avanzada)** | Si el usuario cierra el navegador antes del retorno, el webhook sincroniza el estado igual |

---

## Ajustes que el backend debe incorporar a su plan

1. **`confirmar` devuelve la `OrderApi` completa.** `POST /api/pagos/webpay/confirmar` responde `{ success, orden: OrderApi, payment }`. Sin esto, el frontend necesitaría un GET adicional (o el polling `estado/{ordenId}`) para la pantalla de success — se elimina ese round-trip.
2. **`confirmar` idempotente desde la base.** Si la transacción ya está `APROBADA`, devolver el resultado guardado en vez de llamar `commit` de nuevo. El doble POST ocurre en el camino feliz (refresh de la página de retorno).
3. **Retorno por GET (además de POST).** La documentación oficial dice que en API 1.1+ el retorno normal llega por **GET** con `token_ws` en la URL; el plan del backend menciona solo POST. Aceptar ambos.
4. **`buy_order` desde el id de la orden**, formato alfanumérico ≤ 26 caracteres. El monto siempre se toma de la orden en BD, nunca del request.
5. **`sessionId`** recomendado al `create` (id de usuario o UUID) para correlacionar en debug.
6. **`iniciar` re-llamable** (evitar transacciones Transbank duplicadas por doble clic o retry). Puede ir en fase 2.
7. **Respuesta de rechazo con `motivo`** (`ABORTED` / `TIMEOUT` / `REJECTED`) para que el frontend muestre el mensaje correcto.
8. **TTL de `PENDIENTE`** — fase 2, diseñado de forma transversal (ver "Pendientes" más abajo).

---

## Pendientes (fuera del camino feliz)

1. **TTL de órdenes `PENDIENTE`** — diseñarlo en fase 2 considerando **todos los métodos** de pago (transferencia, contraentrega, pasarela), no solo Webpay. Hoy el timeout de carrito ya libera stock, pero la orden `PENDIENTE` con stock reservado no expira.
2. **Webhook de Transbank** — no necesario para dev; sí recomendado para producción (sincroniza el estado si el usuario cierra el navegador antes del retorno).
3. **Manejo completo de casos borde** — abort (`TBK_TOKEN`), timeout, anulación (endpoint admin). La doble confirmación ya queda cubierta por el Paso 6.
