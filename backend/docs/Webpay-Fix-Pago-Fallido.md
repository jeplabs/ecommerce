# Webpay Plus — Fix del retorno de pago fallido (reintento)

> Complementa a [`Webpay-Contrato-Frontend-Backend.md`](./Webpay-Contrato-Frontend-Backend.md),
> a [`Plan-de-integracion-Webpay-Plus.md`](./Plan-de-integracion-Webpay-Plus.md) y a
> [`Webpay-Casos-Borde-Pendientes.md`](./Webpay-Casos-Borde-Pendientes.md).
>
> **Estado:** el frontend (Pieza C) está **implementado y testeado**. El backend (Piezas A y B)
> queda **pendiente de implementar por el equipo backend**, siguiendo las Piezas A y B de este doc.
> Referencia oficial de Transbank: https://www.transbankdevelopers.cl/documentacion/webpay-plus

---

## 1. Problema que se resuelve

Cuando el pago Webpay termina en **rechazo, abandono (ABORTED) o timeout**, la orden queda
`PENDIENTE` (reserva intacta) y el cliente vuelve a `/checkout/webpay/retorno`, donde la página de
recuperación le ofrece **"Intentar pagar nuevamente"**. Ese botón llama `POST /api/pagos/webpay/iniciar`.

El bug: en los casos **ABORTED** y **TIMEOUT** la transacción anterior queda `INICIADA` en BD y la
dedupe de `iniciar()` la reutiliza, devolviendo un **token muerto** → el cliente vuelve a caer en
Webpay rechazado → **bucle de reintento**.

### 1.1 Los 4 flujos de retorno según la documentación oficial de Transbank

La return_url puede recibirse de **4 formas distintas**, cada una con datos distintos:

| # | Flujo | Parámetros que llegan |
|---|---|---|
| 1 | **Normal** (aprobado o rechazado) | solo `token_ws` |
| 2 | **Timeout** (tiempo excedido: 4 min prod / 10 min integración) | solo `TBK_ID_SESION` + `TBK_ORDEN_COMPRA` — **no llega token** |
| 3 | **Abortado** (botón "anular compra") | `TBK_TOKEN` + `TBK_ID_SESION` + `TBK_ORDEN_COMPRA` |
| 4 | Error en el formulario + "volver al sitio" | `token_ws` + `TBK_TOKEN` + `TBK_ID_SESION` + `TBK_ORDEN_COMPRA` |

Puntos textuales de la doc de Transbank que sustentan el diseño:

> **Timeout**: "Llegará solamente `TBK_ID_SESION` que contiene el `session_id` enviado al crear la
> transacción, `TBK_ORDEN_COMPRA` que representa el `buy_order` enviado. **No llegará token**."
>
> **Abortado**: "El comercio con la variable `TBK_TOKEN` consulta la transacción para validar el
> estado (**no es necesario confirmar la transacción**)."
>
> **session_id**: "Es para uso interno del comercio, y **se incluye en todas las respuestas
> posteriores** relacionadas a la misma transacción."

### 1.2 Estado actual por caso

| Caso | ¿Quién marca la transacción terminal? | ¿El retry crea transacción nueva? |
|---|---|---|
| REJECTED | El `confirmar` que el frontend llama al volver (tx → `RECHAZADA`) | ✅ Sí (no queda `INICIADA`) |
| ABORTED | `procesarAbortado` **ya existe** en backend; ahora el frontend lo invoca (`notificarAbortada`) | ✅ Sí (con Pieza C implementada) |
| TIMEOUT | **No existe hoy** | ❌ No (reutiliza la `INICIADA` muerta) |

Estado de la transacción (`webpay_transacciones`): `INICIADA → APROBADA | RECHAZADA | ABORTADA | TIMEOUT`.
Una transacción terminal **nunca se reutiliza**; el reintento debe crear una nueva sobre la misma
orden `PENDIENTE`.

---

## 1.5 Análisis — por qué TIMEOUT no tiene soporte en el backend hoy

El `sessionId` **se guarda** al crear la transacción (`WebpayService.iniciar()`, línea 55:
`UUID.randomUUID()`, persistido en `WebpayTransaccion.java:28,57`). Y el `TBK_ID_SESION` que
Transbank devuelve es **ese mismo valor**. Es decir, el backend **podría** identificar la
transacción por sessionId… pero la cadena está rota en todos sus eslabones:

| Eslabón | ¿Existe hoy? | Evidencia |
|---|---|---|
| El frontend envía `TBK_ID_SESION` al backend | ❌ | `CheckoutReturn.tsx` (antes de la Pieza C) solo llamaba `cargarRecuperacion('timeout')`, sin ningún fetch |
| El endpoint lo acepta como parámetro | ❌ | `WebpayController.java:35-36` (GET) y `:45-46` (POST): solo `token_ws` y `TBK_TOKEN` |
| El repositorio busca por sessionId | ❌ | `WebpayTransaccionRepository.java:7-16`: solo `findByToken`, `findByOrdenIdAndEstado`, `findByOrdenId` |
| Hay lógica que marque `TIMEOUT` | ❌ | `confirmar()` (WebpayService:82-92), webhook (132-149) y schedulers: ninguno |

Además, el **webhook** (`procesarWebhook`) solo hace `commit(tokenWs)` y nunca pone `TIMEOUT`, y
**no existe ningún `@Scheduled`** que limpie `INICIADA` huérfanas (el único es `CarritoScheduler`).

> **Contraste con ABORTED:** en el flujo 3 Transbank sí devuelve `TBK_TOKEN`, y el backend ya tenía
> `procesarAbortado` (WebpayService:197-205) que busca por `findByToken`. Por eso ABORTED se
> resolvió **solo con frontend** (Pieza C: `notificarAbortada`). En TIMEOUT **no hay token**, así que
> el identificador documentado es `TBK_ID_SESION`/`TBK_ORDEN_COMPRA` — pero falta todo el cableado.

---

## 2. Solución — 3 piezas complementarias

| Pieza | Capa | Qué hace | Estado |
|---|---|---|---|
| **A. Backend: resolver timeout por identificador** | Backend | El endpoint `confirmar` acepta `TBK_ID_SESION`/`TBK_ORDEN_COMPRA`; nuevo `findBySessionId`; `procesarTimeout` marca la tx exacta `TIMEOUT` | **Pendiente** (Paso 1) |
| **B. Backend: ventana de gracia** | Backend | `iniciar()` solo reutiliza una `INICIADA` reciente (< 2 min, doble clic real); si es vieja/huérfana la marca `TIMEOUT` y crea transacción nueva | **Pendiente** (Paso 2) |
| **C. Frontend: notificar el retorno** | Frontend | `notificarAbortada(tbkToken)` en aborted + `notificarTimeout(tbkIdSesion, tbkOrdenCompra)` en timeout, llamando `GET /confirmar` | **Implementado** (Paso 3) |

- La **Pieza A** es la solución **primaria** para timeout: es **determinística** (identifica la
  transacción exacta por `session_id`, como diseño la documentación de Transbank) y marca `TIMEOUT`
  **en el instante** del retorno.
- La **Pieza B** es la **red de seguridad** para los casos en que el retorno **nunca llega**
  (pestaña cerrada, red caída antes de que cargue el SPA, fallo de red de `notificarTimeout`).
  Ahí no hay llamada que reciba el sessionId, y solo la antigüedad en `iniciar()` rescata el retry.
  También protege el doble clic real (< 2 min).
- La **Pieza C** (ya implementada) además de notificar, muestra la página de recuperación con
  resumen del pedido, "Intentar pagar nuevamente" y "Cancelar pedido".

**¿Por qué no solo la ventana de gracia (Pieza B)?** Porque es una heurística por antigüedad:
adivina, no identifica, y deja la tx `INICIADA` hasta que el usuario reintenta. La Pieza A sigue el
flujo documentado por Transbank (el `session_id` existe precisamente para eso), es determinística y
deja el estado fiel (`TIMEOUT`) de inmediato.

---

## 3. Paso 1 — Backend (Pieza A): resolver el timeout por `TBK_ID_SESION`

### 3.1 Controller — aceptar los parámetros de timeout

**Archivo:** `backend/src/main/java/com/jeplabs/ecommerce/controller/WebpayController.java`

**Antes (GET `/confirmar`, líneas 34-38):**

```java
    public ResponseEntity<DatosRespuestaConfirmarWebpay> confirmarGet(
            @RequestParam(value = "token_ws", required = false) String tokenWs,
            @RequestParam(value = "TBK_TOKEN", required = false) String tbkToken) {
        return ResponseEntity.ok(service.confirmar(tokenWs, tbkToken));
    }
```

**Después:**

```java
    public ResponseEntity<DatosRespuestaConfirmarWebpay> confirmarGet(
            @RequestParam(value = "token_ws", required = false) String tokenWs,
            @RequestParam(value = "TBK_TOKEN", required = false) String tbkToken,
            @RequestParam(value = "TBK_ID_SESION", required = false) String tbkIdSesion,
            @RequestParam(value = "TBK_ORDEN_COMPRA", required = false) String tbkOrdenCompra) {
        return ResponseEntity.ok(service.confirmar(tokenWs, tbkToken, tbkIdSesion, tbkOrdenCompra));
    }
```

> **Nota:** `TBK_ID_SESION`/`TBK_ORDEN_COMPRA` se reciben pero no se usan todavía en el service;
> por ahora se pasan para mantener la firma estable y permitir que la Pieza A evolucione.
> Hacer lo mismo en el **POST `/confirmar`** (líneas 44-52) para mantener paridad.

### 3.2 Repository — buscar por sessionId

**Archivo:** `backend/src/main/java/com/jeplabs/ecommerce/domain/pago/webpay/WebpayTransaccionRepository.java`

Agregar (después de la línea 13):

```java
    // Timeout: Transbank NO devuelve token, solo TBK_ID_SESION (sessionId) y TBK_ORDEN_COMPRA
    Optional<WebpayTransaccion> findBySessionId(String sessionId);
```

> `sessionId` es un `UUID.randomUUID()` por transacción (WebpayService:55), por lo que es único en
> la práctica. Si se prefiere usar `buy_order` (único por constraint en `V21`), alternativo:
> `Optional<WebpayTransaccion> findByBuyOrder(String buyOrder);`

### 3.3 Service — nueva rama de timeout en `confirmar()` + `procesarTimeout`

**Archivo:** `backend/src/main/java/com/jeplabs/ecommerce/domain/pago/webpay/WebpayService.java`

Cambiar la firma (líneas 82-92) a:

```java
    @Transactional
    public DatosRespuestaConfirmarWebpay confirmar(
            String tokenWs, String tbkToken, String tbkIdSesion, String tbkOrdenCompra) {

        // CASO BORDE PRIORIDAD 2: ABORTED (flujo 3: TBK_TOKEN)
        if (tokenWs == null && tbkToken != null) {
            return procesarAbortado(tbkToken);
        }

        // CASO BORDE PRIORIDAD 2: TIMEOUT (flujo 2: no hay token, solo sessionId/orden)
        if (tokenWs == null && tbkIdSesion != null) {
            return procesarTimeout(tbkIdSesion);
        }

        if (tokenWs == null) {
            return DatosRespuestaConfirmarWebpay.fallido(
                    "Token de pago no recibido", MotivoRechazoWebpay.ABORTED);
        }
        // …resto sin cambios (findByToken + commit)…
    }
```

Agregar el método privado (junto a `procesarAbortado`, ~línea 205):

```java
    private DatosRespuestaConfirmarWebpay procesarTimeout(String tbkIdSesion) {
        transaccionRepositorio.findBySessionId(tbkIdSesion).ifPresent(tx -> {
            if (tx.estaIniciada()) {
                tx.rechazar(MotivoRechazoWebpay.TIMEOUT, null); // dirty-checking
            }
        });
        return DatosRespuestaConfirmarWebpay.fallido(
                "Se agotó el tiempo en Webpay", MotivoRechazoWebpay.TIMEOUT);
    }
```

**Justificación:** en el flujo de timeout Transbank **no envía token**, por lo que `findByToken` (y
por tanto `procesarAbortado`) es imposible. El `session_id` es el único identificador documentado
para este caso ("para uso interno del comercio, incluido en todas las respuestas posteriores"). Con
`findBySessionId` + `procesarTimeout` se resuelve la transacción **exacta** y se la marca `TIMEOUT`
de inmediato, de forma determinística.

> `rechazar(MotivoRechazoWebpay.TIMEOUT, null)` ya existe (`WebpayTransaccion.java:78-87`) y pone el
> estado `TIMEOUT` (terminal). Persiste por dirty-checking, igual que en `procesarRechazada`.

---

## 4. Paso 2 — Backend (Pieza B): ventana de gracia en `iniciar()` (respaldo)

**Archivo:** `backend/src/main/java/com/jeplabs/ecommerce/domain/pago/webpay/WebpayService.java`

### 4.1 Agregar imports (después de la línea 16 `import java.math.BigDecimal;`)

```java
import java.time.Duration;
import java.time.LocalDateTime;
```

### 4.2 Agregar constante a nivel de clase (junto a las otras `@Value`, ~línea 30)

```java
    // Ventana para reutilizar una INICIADA (protege contra doble clic real); pasado este
    // tiempo se considera huérfana (timeout/abandonada sin retorno) y se marca terminal.
    private static final Duration VENTANA_REUTILIZAR_INICIADA = Duration.ofMinutes(2);
```

### 4.3 Reemplazar el bloque de dedupe (líneas 43–50)

**Antes:**

```java
        // CASO BORDE PRIORIDAD 1: evitar duplicados por doble clic o retry
        var transaccionExistente = transaccionRepositorio
                .findByOrdenIdAndEstado(orden.getId(), EstadoWebpayTransaccion.INICIADA);

        if (transaccionExistente.isPresent()) {
            WebpayTransaccion tx = transaccionExistente.get();
            return new DatosRespuestaIniciarWebpay(tx.getToken(), tx.getUrl());
        }
```

**Después:**

```java
        // CASO BORDE PRIORIDAD 1: reutilizar solo doble clic real (reciente);
        // una INICIADA huérfana (sin retorno) se marca terminal y se crea una nueva.
        var transaccionExistente = transaccionRepositorio
                .findByOrdenIdAndEstado(orden.getId(), EstadoWebpayTransaccion.INICIADA);

        if (transaccionExistente.isPresent()) {
            WebpayTransaccion tx = transaccionExistente.get();
            boolean reciente = tx.getCreadoAt() != null &&
                    Duration.between(tx.getCreadoAt(), LocalDateTime.now())
                            .compareTo(VENTANA_REUTILIZAR_INICIADA) < 0;
            if (reciente) {
                return new DatosRespuestaIniciarWebpay(tx.getToken(), tx.getUrl());
            }
            tx.rechazar(MotivoRechazoWebpay.TIMEOUT, null); // persistido por dirty-checking
        }
```

Al caer al bloque `try` siguiente (líneas 52–77, **sin cambios**) se genera un `buyOrder` nuevo
(`ORD-{id}-{random}`, por eso no choca con el `UNIQUE(buy_order)` de la tabla) y se crea la
transacción nueva con `webpayConfig.crearTransaction().create(...)`.

> **Nota:** `webpay_transacciones` tiene `UNIQUE` solo sobre `token` y `buy_order`
> (migración `V21__create_webpay_transacciones.sql`), **no** sobre `orden_id`: múltiples
> transacciones por orden son válidas. No se requiere migración nueva.
>
> `getCreadoAt()` ya existe (Lombok `@Getter` sobre `creadoAt`, `WebpayTransaccion.java:49`).

**Justificación (por qué mantenerla aunque exista la Pieza A):** la Pieza A necesita que el retorno
llegue y que la red funcione. Si el usuario **cierra la pestaña** (o la red falla antes de que el
SPA envíe `notificarTimeout`), la tx queda `INICIADA` sin que nadie la marque; el siguiente retry
sería un bucle. La antigüedad en `iniciar()` rescata **todos** esos casos huérfanos con un solo
bloque. Además protege el **doble clic real** (recientes < 2 min se reutilizan).

---

## 5. Paso 3 — Frontend (Pieza C): ya implementado

> Esta sección documenta lo que ya está en el repo y sus tests.

### 5.1 `notificarTimeout` en `paymentGatewayApi.ts`

**Archivo:** `frontend/src/features/checkout/api/paymentGatewayApi.ts` (líneas 75-96)

```ts
/**
 * {@code GET /api/pagos/webpay/confirmar?TBK_ID_SESION=...&TBK_ORDEN_COMPRA=...}
 * Marca la transacción como TIMEOUT en backend cuando el pago expiró en Webpay.
 * En el retorno por timeout Transbank NO envía token, solo TBK_ID_SESION/TBK_ORDEN_COMPRA.
 */
export async function notificarTimeout(
    tbkIdSesion: string,
    tbkOrdenCompra?: string
): Promise<void> {
    const params = new URLSearchParams();
    params.set('TBK_ID_SESION', tbkIdSesion);
    if (tbkOrdenCompra) params.set('TBK_ORDEN_COMPRA', tbkOrdenCompra);

    const response = await fetch(
        `${API_URL}/api/pagos/webpay/confirmar?${params.toString()}`,
        { method: 'GET', headers: getAuthHeaders(getToken()) }
    );

    if (!response.ok) {
        throwApiError(response, await readJson(response), 'Error al notificar pago con timeout');
    }
}
```

Agregada al objeto `paymentGatewayApi` (líneas 98-103) y exportada desde el barrel
`frontend/src/features/checkout/api/index.ts`.

### 5.2 Llamada en `CheckoutReturn.tsx` (rama de timeout, líneas 123-129)

```tsx
            if (tbkOrdenCompra || tbkIdSesion) {
                if (tbkIdSesion) {
                    void notificarTimeout(tbkIdSesion, tbkOrdenCompra).catch(() => undefined);
                }
                void cargarRecuperacion('timeout');
                return;
            }
```

- Se dispara **solo** cuando llega `TBK_ID_SESION` (en el flujo 2 de la doc de Transbank); si solo
  llega `TBK_ORDEN_COMPRA` se muestra la recuperación sin notificar (no hay identificador fiable).
- La llamada es **best-effort**: `catch(() => undefined)` evita unhandled rejection; si falla, la
  Pieza B (ventana de gracia) rescata el retry.
- Para aborted ya existe `notificarAbortada(tbkToken)` en la rama anterior (líneas 118-122).

---

## 6. Paso 4 — Tests

### 6.1 Frontend (ya agregados y en verde)

- `CheckoutReturn.test.tsx`:
  - `'notifica el abandono al backend cuando llega TBK_TOKEN'` → verifica `GET /confirmar?TBK_TOKEN=abc`.
  - `'notifica el timeout al backend cuando llega TBK_ID_SESION'` → verifica
    `GET /confirmar?TBK_ID_SESION=sess-1&TBK_ORDEN_COMPRA=501`.
- `paymentGatewayApi.test.ts`:
  - `'notifica el timeout enviando TBK_ID_SESION y TBK_ORDEN_COMPRA'`.
  - `'lanza ApiError cuando notificarTimeout responde 404'`.
- `CheckoutReturn.errors.test.tsx`: mock de `paymentGatewayApi` actualizado con `notificarTimeout`.

### 6.2 Backend (opcional, no hay tests de `WebpayService` hoy)

Sugerido:
- `confirmar(null, null, "sess-1", null)` con `findBySessionId` mockeado → verifica que la tx pasa a
  `TIMEOUT` y se devuelve `fallido(...TIMEOUT)`.
- `iniciar()` con una `INICIADA` de `creadoAt` viejo → verifica `rechazar(TIMEOUT)` y creación nueva;
  con `creadoAt` reciente → reutiliza el token.

---

## 7. Verificación

```bash
# Frontend (implementado — ya debe pasar)
cd frontend
npx eslint src/features/checkout/ui/CheckoutReturn/CheckoutReturn.tsx src/features/checkout/api/paymentGatewayApi.ts src/features/checkout/api/index.ts
npx tsc --noEmit
npx vitest run --pool=threads src/features/checkout/ui/CheckoutReturn src/features/checkout/api/paymentGatewayApi.test.ts src/features/checkout/model/useCheckoutLogic.test.tsx

# Backend (tras aplicar Pasos 1 y 2)
cd backend
mvn -q compile        # o el comando del proyecto (gradle/./mvnw según corresponda)
```

**Prueba manual (integración/Transbank test):**
1. Pagar con Webpay y **abortar** → recuperación → "Intentar pagar nuevamente" → token nuevo ✅.
2. Dejar vencer el **timeout** (10 min integración) → vuelve con `TBK_ID_SESION`/`TBK_ORDEN_COMPRA`
   → Pieza C notifica → Pieza A marca `TIMEOUT` → retry con token nuevo ✅.
3. Pago **rechazado** → retry → confirmar (caso que ya funcionaba, no debe regresar) ✅.
4. **Cerrar la pestaña** sin volver → reintentar más tarde desde órdenes → Pieza B marca la
   `INICIADA` vieja como `TIMEOUT` y crea una nueva ✅.
5. Doble clic en "Pagar con Webpay" en el checkout → reutiliza la tx reciente (ventana de gracia) ✅.

---

## 8. Casos cubiertos y límites

| Caso | Cubierto por | Resultado |
|---|---|---|
| REJECTED | (ya funcionaba) | Retry crea tx nueva ✅ |
| ABORTED intencional | Pieza C (`notificarAbortada`) + respaldo Pieza B | Tx `ABORTADA`, retry crea tx nueva ✅ |
| TIMEOUT (retorno llega) | Pieza C (`notificarTimeout`) + Pieza A | Tx `TIMEOUT` al instante, retry crea tx nueva ✅ |
| INICIADA huérfana (pestaña cerrada, retorno nunca llega) | Pieza B (ventana de gracia) | Se marca `TIMEOUT` en el siguiente retry ✅ |
| Fallo de red en `notificarTimeout`/`notificarAbortada` | Pieza B (respaldo) | El retry igualmente crea tx nueva ✅ |
| Doble clic en checkout | Ventana de gracia (2 min) | Reutiliza la misma tx ✅ |

**Límites / a decidir en equipo:**
- `VENTANA_REUTILIZAR_INICIADA` (2 min) es un umbral arbitrario; ajustar si el doble envío real
  necesita más/menos holgura.
- **POST vs GET del retorno**: Transbank llega por GET en prod (v1.1+) pero por POST en integración
  para aborted. El SPA actual lee `useSearchParams` (GET). El POST /confirmar del backend ya existe
  por compatibilidad; revisar si el SPA necesita soportar el retorno por POST para pruebas locales.
- El caso "el cliente pagó pero perdió conexión antes del retorno (transacción AUTHORIZED sin
  reconocer)" **no** lo resuelven las Piezas A/B: requiere `Transaction.status(token)` con polling
  (los 7 días de la doc) o un scheduler. Ver **Caso 1** en
  [`Webpay-Casos-Borde-Pendientes.md`](./Webpay-Casos-Borde-Pendientes.md).
- Expiración automática de órdenes `PENDIENTE`, reembolso autorizado por admin, webhook con secreto,
  polling del estado y `returnUrl` del request ignorado: ver **Casos 2-8** en
  [`Webpay-Casos-Borde-Pendientes.md`](./Webpay-Casos-Borde-Pendientes.md).
- Alternativa más simple si el equipo quiere **cero cambios en frontend**: la **Opción 2** — en
  `iniciar()`, marcar **siempre** la `INICIADA` existente como terminal y crear nueva (elimina la
  reutilización; seguro porque el frontend ya bloquea doble envío con `processing`/
  `checkoutCompletedRef`). Queda documentada como alternativa, pero pierde el estado `TIMEOUT`
  inmediato y fiel que da la Pieza A.

---

## 9. Archivos y endpoints involucrados

| Archivo | Cambio |
|---|---|
| `backend/.../WebpayController.java` | GET/POST `/confirmar`: aceptar `TBK_ID_SESION`/`TBK_ORDEN_COMPRA` (34-52) — **pendiente** |
| `backend/.../WebpayTransaccionRepository.java` | `findBySessionId` nuevo (opcional `findByBuyOrder`) — **pendiente** |
| `backend/.../WebpayService.java` | `confirmar()` con rama timeout + `procesarTimeout` (82-92, ~205); ventana de gracia en `iniciar()` (43-50) — **pendiente** |
| `backend/.../WebpayTransaccion.java` | `rechazar(TIMEOUT)` ya existe (78-87); `getCreadoAt` (49) — sin cambios |
| `backend/.../db/migration/V21__create_webpay_transacciones.sql` | UNIQUE solo en `token`/`buy_order` — sin migración nueva |
| `frontend/src/features/checkout/api/paymentGatewayApi.ts` | `notificarTimeout` (75-96), objeto (98-103) — **implementado** |
| `frontend/src/features/checkout/api/index.ts` | export `notificarTimeout` — **implementado** |
| `frontend/src/features/checkout/ui/CheckoutReturn/CheckoutReturn.tsx` | rama `TBK_ID_SESION` → `notificarTimeout` (123-129) — **implementado** |
| `frontend/src/test/msw/handlers.ts` | handler `GET /confirmar` para `TBK_TOKEN` y `TBK_ID_SESION` — **implementado** |
