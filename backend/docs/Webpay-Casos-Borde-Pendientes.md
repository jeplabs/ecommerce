# Webpay Plus — Casos borde pendientes (análisis y soluciones propuestas)

> Complementa a [`Webpay-Fix-Pago-Fallido.md`](./Webpay-Fix-Pago-Fallido.md) y a
> [`Webpay-Contrato-Frontend-Backend.md`](./Webpay-Contrato-Frontend-Backend.md).
> Contiene los casos que **aún faltan resolver** con Webpay, con las soluciones de código
> específicas (backend/frontend) y su justificación, para revisión del equipo.
> Referencia oficial: https://www.transbankdevelopers.cl/documentacion/webpay-plus

---

## Contexto — los 4 flujos de retorno según Transbank

| # | Flujo | Parámetros que llegan |
|---|---|---|
| 1 | **Normal** (aprobado o rechazado) | solo `token_ws` |
| 2 | **Timeout** (tiempo excedido: 4 min prod / 10 min integración) | solo `TBK_ID_SESION` + `TBK_ORDEN_COMPRA` — **no llega token** |
| 3 | **Abortado** (botón "anular compra") | `TBK_TOKEN` + `TBK_ID_SESION` + `TBK_ORDEN_COMPRA` |
| 4 | Error en el formulario + "volver al sitio" | `token_ws` + `TBK_TOKEN` + `TBK_ID_SESION` + `TBK_ORDEN_COMPRA` |

Estado de transacción (`webpay_transacciones`): `INICIADA → APROBADA | RECHAZADA | ABORTADA | TIMEOUT`.
Estado de orden: `PENDIENTE | CONFIRMADA | EN_PROCESO | ENVIADA | ENTREGADA | CANCELADA`.

---

## Caso 1 — "Usuario fantasma": pagó pero se perdió la confirmación (riesgo de doble cobro)

**Severidad:** ALTO · **Backend:** Sí · **Frontend:** refuerza con Caso 5

### El problema

El cliente completa el pago en el banco (la transacción queda `AUTHORIZED` en Transbank) pero se cae
la red o cierra la pestaña **antes** de volver al retorno. En nuestra BD la tx sigue `INICIADA`. Al
reintentar:

- La **Pieza B** del fix actual (`iniciar()`, ventana de gracia) marcaría esa `INICIADA` vieja como
  `TIMEOUT` **cuando en realidad fue aprobada** → crea transacción nueva → **doble cobro**.
- No existe ningún uso de `Transaction.status(token)` en el backend hoy (verificado: 0 resultados).
- El webhook existe (`procesarWebhook`, WebpayService:132-149), pero en modo integración Transbank
  **no lo envía**, y en producción depende de que llegue.

### Solución backend

**1. `WebpayTransaccionRepository.java`** — buscar huérfanas por antigüedad:

```java
List<WebpayTransaccion> findByEstadoAndCreadoAtBefore(
        EstadoWebpayTransaccion estado, LocalDateTime limite);
```

**2. Nuevo `WebpayReconciliacionScheduler`** (patrón `CarritoScheduler`), `@Scheduled` cada ~5 min:

```java
@Scheduled(fixedDelayString = "${api.webpay.reconciliacion-fixed-delay-ms:300000}")
public void reconciliar() {
    LocalDateTime limite = LocalDateTime.now().minusMinutes(10); // timeout integración Webpay
    transaccionRepositorio.findByEstadoAndCreadoAtBefore(INICIADA, limite).forEach(tx -> {
        try {
            var st = webpayConfig.crearTransaction().status(tx.getToken());
            switch (st.getStatus()) {
                case "AUTHORIZED" -> /* commit → procesarAprobada (confirmar, no recobrar) */
                case "REJECTED"   -> tx.rechazar(MotivoRechazoWebpay.REJECTED, st.getResponseCode());
                case "ABORTED"    -> tx.rechazar(MotivoRechazoWebpay.ABORTED, null);
                default           -> { /* INITIALIZED: diferir; >7 días → TIMEOUT */ }
            }
        } catch (Exception e) {
            System.err.println("Error reconciliando tx " + tx.getToken() + ": " + e.getMessage());
        }
    });
}
```

**3. Corregir la Pieza B** (`iniciar()`, ventana de gracia): **antes** de `tx.rechazar(TIMEOUT)`
sobre una `INICIADA` vieja, consultar `status(token)`:

```java
if (!reciente) {
    WebpayPlusTransactionStatusResponse st =
            webpayConfig.crearTransaction().status(tx.getToken());
    if ("AUTHORIZED".equals(st.getStatus())) {
        // La orden SÍ fue pagada: confirmar y devolver éxito, nunca crear una nueva.
        return procesarAprobada(tx, /* commit previo */); // o commit + procesarAprobada
    }
    if ("REJECTED".equals(st.getStatus())) {
        tx.rechazar(MotivoRechazoWebpay.REJECTED, st.getResponseCode());
    } else if ("ABORTED".equals(st.getStatus())) {
        tx.rechazar(MotivoRechazoWebpay.ABORTED, null);
    } else {
        tx.rechazar(MotivoRechazoWebpay.TIMEOUT, null);
    }
}
```

### Justificación

El timeout de integración de Webpay es **10 minutos** (4 en producción); el scheduler espera ese
margen antes de declarar huérfana una `INICIADA`, y consulta el **estado real** en Transbank en vez
de adivinar por antigüedad. Esto elimina el doble cobro y cierra el caso del "usuario fantasma" sin
depender del webhook.

### Consideraciones

- Error de red en `status()`: decisión de política — **no** crear transacción nueva (evita doble
  cobro) y loggear, o marcar `TIMEOUT` (más simple pero riesgoso). Recomendado: no crear nueva.
- `Transaction.status()` está disponible hasta **7 días** desde la creación (doc Transbank).

---

## Caso 2 — Webhook sin validar el secreto

**Severidad:** ALTO · **Backend:** Sí · **Frontend:** No

### El problema

`WebpayController.webhook` (líneas 62-74) recibe `X-Webhook-Secret` pero **solo hay un comentario**
("En producción comparar con api.webpay.webhook-secret") — nunca se compara. El endpoint es
`permitAll` (SecurityConfigurations:58) y hace `commit(tokenWs)` con cualquier token.

### Solución backend

```java
@Value("${api.webpay.webhook-secret}")
private String webhookSecret;

@PostMapping("/webhook")
public ResponseEntity<Void> webhook(
        @RequestParam(value = "token_ws", required = false) String tokenWs,
        @RequestHeader(value = "X-Webhook-Secret", required = false) String secret) {
    if (!webhookSecret.equals(secret)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    if (tokenWs != null) {
        service.procesarWebhook(tokenWs);
    }
    return ResponseEntity.ok().build();
}
```

Asegurar la property en `application.properties` (ya existe en
`application-dev.properties.example`, línea 68). El endpoint se mantiene `permitAll` (lo llama
Transbank sin JWT) pero ahora validado por header.

### Justificación

Un webhook público que confirma transacciones con tokens arbitrarios permite que un tercero dispare
confirmaciones no deseadas. El header secreto es el mecanismo documentado por Transbank.

---

## Caso 3 — Cancelar una orden CONFIRMADA sin reembolso

**Severidad:** ALTO · **Backend:** Sí · **Frontend:** opcional (UI admin, pendiente)

### El problema

`cancelarMiOrden` / `cambiarEstado(CANCELADA)` (OrdenService:227-249) permiten `CONFIRMADA →
CANCELADA` (EstadoOrden:17) y devuelven stock, pero **no existe `refund()`** de Transbank: el cliente
queda cobrado sin reembolso.

### Flujo acordado (NO automático)

1. El cliente cancela una orden **ya confirmada** → la orden pasa a un estado **ANULADO** y el
   cliente recibe un correo: "solicitaste anular tu compra ya efectuada y se solicitó el reembolso".
   **No** se devuelve stock todavía.
2. El **admin autoriza** el reembolso → `Transaction.refund(token, monto)` en Transbank.
3. Al confirmarse el reembolso → transacción pasa a **REEMBOLSADA**, la orden queda en estado final
   **REEMBOLSADO**, se devuelve el stock y (opcional) se envía correo de confirmación.

### Solución backend

**1. Estados nuevos.**

```java
// EstadoOrden.java
ANULADO, REEMBOLSADO;   // + reglas en puedeTransicionarA()
// EstadoWebpayTransaccion.java
REEMBOLSADA;            // terminal
```

**2. `WebpayTransaccion.java`** — marcar el reembolso:

```java
public void marcarReembolsada() {
    this.estado = EstadoWebpayTransaccion.REEMBOLSADA;
    this.actualizadoAt = LocalDateTime.now();
}
```

**3. `WebpayService.java`** — ejecutar el refund (reusa `findByOrdenIdAndEstado(APROBADA)`):

```java
@Transactional
public DatosRespuestaRefundWebpay reembolsar(Long ordenId) {
    WebpayTransaccion tx = transaccionRepositorio
            .findByOrdenIdAndEstado(ordenId, EstadoWebpayTransaccion.APROBADA)
            .orElseThrow(() -> new IllegalArgumentException("No hay pago aprobado que reembolsar"));
    try {
        webpayConfig.crearTransaction().refund(tx.getToken(), tx.getMonto().intValue());
        tx.marcarReembolsada();
        return new DatosRespuestaRefundWebpay(ordenId, EstadoWebpayTransaccion.REEMBOLSADA);
    } catch (Exception e) {
        throw new RuntimeException("Error al reembolsar: " + e.getMessage());
    }
}
```

**4. `WebpayController.java`** — endpoint de autorización (solo admin):

```java
@PostMapping("/{ordenId}/reembolsar")
public ResponseEntity<DatosRespuestaRefundWebpay> reembolsar(
        @PathVariable Long ordenId, Authentication authentication) {
    // validar ROLE_ADMIN (o usar @PreAuthorize("hasRole('ADMIN')"))
    return ResponseEntity.ok(service.reembolsar(ordenId));
}
```

**5. `OrdenService.cancelarMiOrden`** — diferenciar por estado:

```java
// PENDIENTE → CANCELADA (sin cargo): comportamiento actual (stock + correo de cancelación)
// CONFIRMADA → ANULADO + correo "solicitaste anular tu compra y se solicitó el reembolso";
//               NO devolver stock hasta que el admin autorice el reembolso.
```

### Justificación

El reembolso involucra mover dinero: **no puede ser automático**. La orden queda `ANULADO` (solicitud
registrada y notificada por correo) y solo tras la autorización del admin se ejecuta el `refund`,
dejando la transacción `REEMBOLSADA` (estado terminal) y la orden `REEMBOLSADO`.

### Consideraciones (a decidir en revisión del equipo)

- **Modelado de estados**: dos alternativas —
  (a) orden `CONFIRMADA → ANULADO → REEMBOLSADO` y tx `REEMBOLSADA` (recomendada, refleja el
  ciclo completo); o
  (b) orden queda `ANULADO` como estado final y solo la tx pasa a `REEMBOLSADA`.
  El doc usa la opción (a); se puede ajustar.
- ¿La orden `ENTREGADA` también puede solicitar anulación/reembolso, o solo `CONFIRMADA`?
- Correo de confirmación de reembolso al cliente: opcional.

---

## Caso 4 — Órdenes PENDIENTE sin expiración automática

**Severidad:** MEDIO · **Backend:** Sí · **Frontend:** No

### El problema

Solo existe `CarritoScheduler`. Las órdenes `PENDIENTE` con stock reservado quedan **para siempre**
si el cliente nunca vuelve ni cancela.

### Solución backend (threshold alineado con Webpay: 10 min)

**1. `OrdenRepository.java`:**

```java
List<Orden> findByEstadoAndCreadoAtBefore(EstadoOrden estado, LocalDateTime limite);
```

**2. Nuevo `OrdenExpiracionScheduler`:**

```java
@Value("${api.orden.expiracion-minutos:10}")
private long expiracionMinutos;

@Scheduled(fixedDelayString = "${api.orden.expiracion-fixed-delay-ms:300000}")
public void expirarOrdenesPendientes() {
    LocalDateTime limite = LocalDateTime.now().minusMinutes(expiracionMinutos);
    ordenRepositorio.findByEstadoAndCreadoAtBefore(PENDIENTE, limite).forEach(orden -> {
        // Reconciliar primero: si hay tx INICIADA, verificar status() (Caso 1)
        // antes de cancelar — no cancelar una orden que en realidad se pagó.
        if (noHayPagoReal(orden)) {
            servicioOrden.expiracionAutomatica(orden); // cancel + devolverStock
        }
    });
}
```

**3. `OrdenService.java`** — método reutilizable:

```java
@Transactional
public void expiracionAutomatica(Orden orden) {
    orden.cancelar();        // PENDIENTE → CANCELADA
    devolverStock(orden);
}
```

### Justificación

El timeout de la doc de Transbank es **10 minutos en integración** (4 en producción). Alinear la
expiración a ese margen evita retener stock de órdenes que Webpay ya dio por vencidas, **siempre que
antes se reconcilie** con `status()` (Caso 1) para no cancelar una orden efectivamente pagada.

### Consideraciones

- En producción el timeout Webpay es **4 min**; `api.orden.expiracion-minutos` es configurable para
  ajustar sin tocar código.

---

## Caso 5 — Polling del estado del pago

**Estado:** ✅ **RESUELTO (frontend implementado)** · **Severidad:** MEDIO · **Backend:** No (endpoint
ya existe) · **Frontend:** ✅ implementado

### El problema

`GET /api/pagos/webpay/estado/{ordenId}` (permitAll, SecurityConfigurations:59) y
`WebpayService.consultarEstado` (122-128) **existían pero el frontend nunca los usaba** (verificado: 0
usos). Si se pierde el redirect de retorno no había fallback.

### Solución implementada (frontend)

1. **`paymentGatewayApi.ts`** — `consultarEstadoWebpay(ordenId)`:

```ts
/** {@code GET /api/pagos/webpay/estado/{ordenId}} */
export async function consultarEstadoWebpay(ordenId: number): Promise<WebpayEstadoSchema> {
    const response = await fetch(`${API_URL}/api/pagos/webpay/estado/${ordenId}`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'Error al consultar el estado del pago Webpay');
    }

    return parseApi(webpayEstadoSchema, raw);
}
```

Exportado desde el barrel `api/index.ts` y agregado al objeto `paymentGatewayApi`.

2. **Schema `webpayEstadoSchema`** en `model/schemas/payment.ts` — **corregido para coincidir con el
   backend**: el DTO `DatosEstadoWebpay` serializa `EstadoWebpayTransaccion`
   (`INICIADA | APROBADA | RECHAZADA | ABORTADA | TIMEOUT`) y `MotivoRechazoWebpay` puede venir como
   `null`:

```ts
export const webpayEstadoSchema = z.object({
    ordenId: z.number(),
    estado: z.enum(['INICIADA', 'APROBADA', 'RECHAZADA', 'ABORTADA', 'TIMEOUT']),
    motivo: z.enum(['ABORTED', 'TIMEOUT', 'REJECTED']).nullish(),
});
```

3. **`useCheckoutLogic.ts`** — efecto de polling (detalle en la siguiente sección).
4. **`handlers.ts` (MSW)** — `GET /api/pagos/webpay/estado/:ordenId` → `{ ordenId, estado: 'INICIADA',
   motivo: null }`.
5. **Tests** — ver "Tests" más abajo.

### Detalle del efecto de polling (`useCheckoutLogic.ts`)

- **Arranque:** cuando `redirectInfo` se setea (justo después de `iniciarWebpay` en la rama Webpay),
  usando `webpayOrdenIdRef` para recordar el `ordenId`.
- **Cadencia (backoff):** el **primer tick es inmediato**; los siguientes usan
  `WEBPAY_POLL_BACKOFF_MS = [2000, 5000, 15000, 30000]` (2 s → 5 s → 15 s → tope 30 s).
- **Deadline (configurable):** `WEBPAY_POLL_TIMEOUT_MS = 5 * 60 * 1000` (5 min) — alineado con el
  timeout de sesión de Transbank en producción (**4 min**) más margen.
- **Pausa por visibilidad:** si `document.hidden`, el tick no consulta y no se reprograman timers;
  el listener `visibilitychange` al volver la pestaña **visible** hace un **tick inmediato** y
  reinicia el backoff desde 0.
- **Estados de la transacción:**
  - `APROBADA` → limpia el pedido pendiente (`limpiarOrdenWebpayPendiente`), resetea `redirectInfo`,
    busca la orden (`orderApi.obtenerOrden`) y **navega a `/checkout/success`** con
    `{ orden, payment: null, isBankTransfer: false }`.
  - `RECHAZADA` / `ABORTADA` / `TIMEOUT` → **detiene** el polling (la recuperación la maneja la
    pantalla de retorno `/checkout/webpay/retorno`).
  - `INICIADA` → sigue esperando.
  - **Error de red** → se ignora (best-effort hasta el deadline).
- **Cleanup:** al desmontar, cambiar `redirectInfo` o llegar al deadline: `activo = false`, se remueve
  el listener y se limpian los timers de backoff y deadline.

### Por qué estos tiempos (mejores prácticas)

- **Backoff en vez de 4 s fijos:** en una ventana completa se pasa de ~46 consultas por checkout
  (1 inicial + 45 ticks en 3 min) a típicamente **<10**.
- **Ventana de 5 min en vez de 3 min:** el timeout de Transbank en producción es 4 min; con 3 min el
  polling se detenía antes de que el webhook pudiera confirmar, dejando el caso sin detectar.
- **Pausa por visibilidad:** como es una **redirección** a Transbank, la pestaña del SPA queda oculta
  e inactiva mientras el usuario paga; consultar en segundo plano es trabajo desperdiciado. Al volver
  el foco hay un check inmediato (UX reactiva).
- **Endpoint barato:** `consultarEstado` es solo un lookup por PK indexada (`findByOrdenId`). El
  polling **nunca** llama a `Transaction.status()` de Transbank (caro y con rate limit) — eso es
  trabajo de la reconciliación programada del Caso 1.

### Tests

- `paymentGatewayApi.test.ts`: parseo con `motivo: null`, `ApiError` en 404, `ZodError` con valor de
  estado desconocido.
- `useCheckoutLogic.test.tsx`: estado `APROBADA` → limpia el pedido pendiente.
- `useCheckoutLogic.polling.test.tsx` (con `vi.useFakeTimers`):
  - **backoff:** primer tick inmediato y cadencia `2 s → 5 s → 15 s → 30 s → 30 s`;
  - **visibilidad:** sin consultas mientras la pestaña está oculta y consulta inmediata al volver.

### Justificación

Refuerza el Caso 1: si el cliente pagó y el retorno se perdió, el polling detecta `APROBADA` y lleva
al usuario al éxito sin reintentar (evita el doble cobro). El polling es **best-effort de UX**; la red
de seguridad definitiva sigue siendo la **reconciliación programada** del Caso 1 (backend, pendiente
de implementar).

---

## Caso 6 — Retorno por POST en integración

**Severidad:** BAJO · **Backend:** opcional · **Frontend:** limitación documentada

### El problema

En modo integración, el retorno **abortado** de Transbank llega por **POST**; el SPA solo lee query
params GET (`useSearchParams`). En producción es GET (API v1.1+).

### Solución propuesta

Documentar la limitación. Alternativa si se quiere probar aborted en integración: un endpoint
backend puente que reciba el POST y redirija al SPA con los parámetros en la query string.

---

## Caso 7 — Validar el monto del commit

**Severidad:** BAJO · **Backend:** Sí · **Frontend:** No

### El problema

`iniciar()` usa el total de la BD, pero `procesarAprobada` no verifica que el monto devuelto por
`commit` coincida con el total de la orden.

### Solución backend

```java
// en procesarAprobada (WebpayService:153)
if (response.getAmount() != transaccion.getMonto().intValue()) {
    transaccion.rechazar(MotivoRechazoWebpay.REJECTED, response.getResponseCode());
    return DatosRespuestaConfirmarWebpay.fallido("Monto no coincide", MotivoRechazoWebpay.REJECTED);
}
```

### Justificación

Defensa en profundidad: si Transbank devuelve un monto distinto al esperado (configuración o
tampering), la orden no se confirma.

---

## Caso 8 — `returnUrl` del request es ignorado (doble fuente de verdad)

**Severidad:** BAJO · **Backend:** No · **Frontend:** Sí

### El problema

La `return_url` es la URL a la que Transbank redirige tras el pago (`create(buyOrder, sessionId,
monto, returnUrl)`). Hay **dos fuentes de verdad**:

- **Frontend**: `useCheckoutLogic.ts:342-343` calcula
  `returnUrl = ${window.location.origin}/checkout/webpay/retorno` y la envía en el body de
  `iniciarWebpay` (paymentGatewayApi.ts).
- **Backend**: `DatosIniciarWebpay` **solo tiene `ordenId`** (líneas 6-9) → el `returnUrl` del JSON se
  **descarta en silencio** (Jackson ignora campos desconocidos). `WebpayService.iniciar()` usa
  `@Value("${api.webpay.return-url}")` (líneas 29-30, 62).

Hoy funciona solo porque la config coincide con la ruta del SPA. Riesgos:

1. **Deriva silenciosa**: cambias una fuente y no la otra → el cliente paga y Transbank lo manda a
   otra URL → orden `PENDIENTE` sin error visible.
2. **Contrato mentiroso**: el payload envía un campo que el backend ignora.
3. **Trampa de seguridad si se "arregla" mal**: si el backend honrara el `returnUrl` del request, un
   atacante podría fijar su propia URL de retorno (redirección arbitraria/phishing).

### Solución (Opción A — recomendada)

**Frontend deja de enviar `returnUrl`**; el backend sigue usando su config (seguro, una sola fuente
de verdad):

1. `useCheckoutLogic.ts:343`: `await iniciarWebpay({ ordenId: orden.id });`
2. `paymentGatewayApi.ts`: quitar `returnUrl` de `iniciarWebpay` (params y body).
3. `paymentGatewayApi.test.ts:98-111`: actualizar/eliminar el test "envía el returnUrl y el ordenId
   al iniciar (assert del body)".
4. Contratos en docs (`Webpay-Contrato-Frontend-Backend.md`): quitar `returnUrl` de `POST /iniciar`.

### Justificación

Mantener la `return_url` fijada en el servidor evita la deriva y el riesgo de redirección arbitraria;
el backend no cambia.

### Consideración

Alternativa C: no tocar código y solo documentar que el campo es ignorado por diseño. La Opción A es
preferible porque elimina el campo muerto.

---

## Tabla resumen

| Caso | Severidad | Backend | Frontend | Responsable |
|---|---|---|---|---|
| 1. Usuario fantasma / doble cobro | ALTO | `status()` + scheduler + corregir Pieza B | refuerza Caso 5 | Equipo backend |
| 2. Webhook sin secreto | ALTO | validar `X-Webhook-Secret` | — | Equipo backend |
| 3. Reembolso autorizado por admin | ALTO | estados + `refund()` + endpoint admin + correos | UI admin (opcional) | Equipo backend (+ frontend) |
| 4. Expiración de órdenes | MEDIO | scheduler 10 min + reconciliación | — | Equipo backend |
| 5. Polling del estado | MEDIO | — (endpoint existe) | ✅ implementado (backoff + visibilidad + 5 min) | ✅ frontend |
| 6. Retorno POST integración | BAJO | opcional (puente) | limitación documentada | Equipo backend |
| 7. Validar monto del commit | BAJO | comparar monto | — | Equipo backend |
| 8. `returnUrl` duplicado | BAJO | — | Opción A: dejar de enviar | Equipo frontend |

## Archivos involucrados

| Archivo | Casos |
|---|---|
| `backend/.../WebpayService.java` | 1, 3, 7 |
| `backend/.../WebpayTransaccionRepository.java` | 1, 3 |
| `backend/.../WebpayTransaccion.java` | 3 |
| `backend/.../EstadoWebpayTransaccion.java` | 3 |
| `backend/.../WebpayController.java` | 2, 3 |
| `backend/.../OrdenRepository.java` / `Orden.java` / `OrdenService.java` / `EstadoOrden.java` | 3, 4 |
| `backend/.../scheduler/` (`WebpayReconciliacionScheduler`, `OrdenExpiracionScheduler`) | 1, 4 |
| `backend/.../SecurityConfigurations.java` | 2 |
| `backend/.../EmailService.java` | 3 |
| `backend/src/main/resources/application*.properties` | 2, 4 |
| `frontend/src/features/checkout/api/paymentGatewayApi.ts` | 5, 8 |
| `frontend/src/features/checkout/api/index.ts` | 5 |
| `frontend/src/features/checkout/model/useCheckoutLogic.ts` | 5, 8 |
| `frontend/src/features/checkout/model/schemas/payment.ts` | 5 |
| `frontend/src/test/msw/handlers.ts` | 5 |
| Tests frontend (`paymentGatewayApi.test.ts`, `useCheckoutLogic.test.tsx`, `useCheckoutLogic.polling.test.tsx`) | 5, 8 |
