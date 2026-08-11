# Webpay Plus — Fix del retorno de pago fallido (reintento)

> Complementa a [`Webpay-Contrato-Frontend-Backend.md`](./Webpay-Contrato-Frontend-Backend.md)
> y a [`Plan-de-integracion-Webpay-Plus.md`](./Plan-de-integracion-Webpay-Plus.md).
> Documenta la **Opción 1**: backend con ventana de gracia + notificación de aborto desde el frontend.

---

## 1. Problema que se resuelve

Cuando el pago Webpay termina en **rechazo, abandono (ABORTED) o timeout**, la orden queda
`PENDIENTE` (reserva intacta) y el cliente vuelve a `/checkout/webpay/retorno`, donde la página de
recuperación le ofrece **"Intentar pagar nuevamente"**. Ese botón llama `POST /api/pagos/webpay/iniciar`.

El bug: en los casos **ABORTED** y **TIMEOUT** la transacción anterior queda `INICIADA` en BD y la
dedupe de `iniciar()` la reutiliza, devolviendo un **token muerto** → el cliente vuelve a caer en
Webpay rechazado → **bucle de reintento**.

| Caso | ¿Quién marca la transacción terminal? | ¿El retry crea transacción nueva? |
|---|---|---|
| REJECTED | El `confirmar` que el frontend llama al volver (tx → `RECHAZADA`) | ✅ Sí (no queda `INICIADA`) |
| ABORTED | **Nadie** hoy | ❌ No (reutiliza la `INICIADA` muerta) |
| TIMEOUT | **Nadie** hoy | ❌ No (reutiliza la `INICIADA` muerta) |

Estado de la transacción (`webpay_transacciones`): `INICIADA → APROBADA | RECHAZADA | ABORTADA | TIMEOUT`.
Una transacción terminal **nunca se reutiliza**; el reintento debe crear una nueva sobre la misma
orden `PENDIENTE`.

---

## 2. Solución (Opción 1) — visión general

| Pieza | Archivo | Qué hace |
|---|---|---|
| 1. Backend: ventana de gracia | `WebpayService.java` | `iniciar()` solo reutiliza una `INICIADA` reciente (< 2 min, doble clic real); si es vieja/huérfana la marca `TIMEOUT` y crea transacción nueva |
| 2. Frontend: notificar aborto | `paymentGatewayApi.ts` | Nueva función `notificarAbortada(tbkToken)` que llama `GET /api/pagos/webpay/confirmar?TBK_TOKEN=...` (endpoint **ya existente**, `permitAll`) |
| 3. Frontend: llamarla en el retorno | `CheckoutReturn.tsx` | Al volver con `TBK_TOKEN`, avisar al backend para marcar la tx `ABORTADA` al instante |

La pieza 2 cierra el caso **abortado intencional** (que puede caer dentro de la ventana de gracia);
la pieza 1 cierra **timeout** y cualquier `INICIADA` huérfana. Ambas son necesarias para cubrir todo.

---

## 3. Paso 1 — Backend: ventana de gracia en `iniciar()`

**Archivo:** `backend/src/main/java/com/jeplabs/ecommerce/domain/pago/webpay/WebpayService.java`

### 3.1 Agregar imports (después de la línea 16 `import java.math.BigDecimal;`)

```java
import java.time.Duration;
import java.time.LocalDateTime;
```

### 3.2 Agregar constante a nivel de clase (junto a las otras `@Value`, ~línea 30)

```java
    // Ventana para reutilizar una INICIADA (protege contra doble clic real); pasado este
    // tiempo se considera huérfana (abortada/timeout) y se marca terminal.
    private static final Duration VENTANA_REUTILIZAR_INICIADA = Duration.ofMinutes(2);
```

### 3.3 Reemplazar el bloque de dedupe (líneas 43–50)

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
        // una INICIADA huérfana (abortada/timeout) se marca terminal y se crea una nueva.
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
> `getCreadoAt()` y `rechazar(...)` ya existen en `WebpayTransaccion.java` (Lombok `@Getter`,
> método en línea 78). `rechazar` persiste por dirty-checking (igual que en `procesarRechazada`).

---

## 4. Paso 2 — Frontend: función `notificarAbortada`

**Archivo:** `frontend/src/features/checkout/api/paymentGatewayApi.ts`

Agregar después de `confirmarWebpay` (líneas 47–61) y **antes** de `export const paymentGatewayApi`
(línea 63):

```ts
/**
 * {@code GET /api/pagos/webpay/confirmar?TBK_TOKEN=...}
 * Marca la transacción como ABORTADA en el backend cuando el cliente abandona Webpay.
 * Endpoint ya existente en WebpayController (GET /confirmar, permitAll).
 */
export async function notificarAbortada(tbkToken: string): Promise<void> {
    const response = await fetch(
        `${API_URL}/api/pagos/webpay/confirmar?TBK_TOKEN=${encodeURIComponent(tbkToken)}`,
        { method: 'GET', headers: getAuthHeaders(getToken()) }
    );

    if (!response.ok) {
        throwApiError(response, await readJson(response), 'Error al notificar pago abandonado');
    }
}
```

Agregar también al objeto agregado (líneas 63–66):

```ts
export const paymentGatewayApi = {
    iniciarWebpay,
    confirmarWebpay,
    notificarAbortada,
};
```

---

## 5. Paso 3 — Frontend: exportar desde el barrel

**Archivo:** `frontend/src/features/checkout/api/index.ts` (líneas 10–14)

```ts
export {
    paymentGatewayApi,
    iniciarWebpay,
    confirmarWebpay,
    notificarAbortada,
} from './paymentGatewayApi';
```

---

## 6. Paso 4 — Frontend: llamarla en el retorno con `TBK_TOKEN`

**Archivo:** `frontend/src/features/checkout/ui/CheckoutReturn/CheckoutReturn.tsx`

### 6.1 Import (línea 4)

**Antes:**

```tsx
import { confirmarWebpay, iniciarWebpay } from '@/features/checkout/api';
```

**Después:**

```tsx
import { confirmarWebpay, iniciarWebpay, notificarAbortada } from '@/features/checkout/api';
```

### 6.2 Llamada en la rama de abandono (líneas 112–116)

**Antes:**

```tsx
        if (!tokenWs) {
            if (tbkToken) {
                void cargarRecuperacion('aborted');
                return;
            }
```

**Después:**

```tsx
        if (!tokenWs) {
            if (tbkToken) {
                void notificarAbortada(tbkToken).catch(() => undefined);
                void cargarRecuperacion('aborted');
                return;
            }
```

> La notificación es **best-effort** (fire-and-forget): si falla la red, la ventana de gracia del
> backend (Paso 1) igual rescata el retry. El `catch(() => undefined)` evita unhandled rejection.
> El 401 de `cargarRecuperacion`/`obtenerOrden` sigue manejado por `redirectUnauthorized`.

---

## 7. Paso 5 — Tests

### 7.1 Frontend: actualizar el mock de `paymentGatewayApi`

**Archivo:** `frontend/src/features/checkout/ui/CheckoutReturn/CheckoutReturn.errors.test.tsx`
(mock en líneas 9–16). Agregar la función al mock:

```ts
vi.mock('@/features/checkout/api/paymentGatewayApi', () => ({
    paymentGatewayApi: {
        iniciarWebpay: vi.fn(),
        confirmarWebpay: vi.fn(),
        notificarAbortada: vi.fn(),
    },
    iniciarWebpay: vi.fn(),
    confirmarWebpay: vi.fn(),
    notificarAbortada: vi.fn(),
}));
```

### 7.2 Frontend: test nuevo en `CheckoutReturn.test.tsx`

Verifica que al volver con `TBK_TOKEN` se notifica al backend antes de mostrar la recuperación
(el handler de MSW ya responde `GET /api/pagos/webpay/confirmar`):

```tsx
it('notifica el abandono al backend cuando llega TBK_TOKEN', async () => {
    let confirmado = false;
    server.use(
        http.get(`${API_BASE}/api/pagos/webpay/confirmar`, ({ request }) => {
            const url = new URL(request.url);
            if (url.searchParams.get('TBK_TOKEN') === 'abc') confirmado = true;
            return HttpResponse.json(
                { success: false, error: 'Abandonado', motivo: 'ABORTED' }
            );
        })
    );
    sessionStorage.setItem('webpay:ordenPendienteId', '501');

    renderReturn('/checkout/retorno?TBK_TOKEN=abc');

    expect(
        await screen.findByText('Resumen del pedido #501', {}, { timeout: 5000 })
    ).toBeInTheDocument();
    expect(confirmado).toBe(true);
});
```

### 7.3 Backend (opcional)

No hay tests de `WebpayService` hoy. Opcional: test unitario con repositorios mockeados que
verifique que una `INICIADA` con `creadoAt` viejo se marca `TIMEOUT` y se crea una nueva
(`verify(transaccionRepositorio).save(any())`, `getEstado() == TIMEOUT` en la anterior).

---

## 8. Verificación

```bash
# Frontend
cd frontend
npx eslint src/features/checkout/ui/CheckoutReturn/CheckoutReturn.tsx src/features/checkout/api/paymentGatewayApi.ts src/features/checkout/api/index.ts
npx tsc --noEmit
npx vitest run --pool=threads src/features/checkout/ui/CheckoutReturn src/features/checkout/api/paymentGatewayApi.test.ts src/features/checkout/model/useCheckoutLogic.test.tsx

# Backend (compilación)
cd backend
mvn -q compile        # o el comando del proyecto (gradle/./mvnw según corresponda)
```

**Prueba manual (integración/Transbank test):**
1. Pagar con Webpay y **abortar** desde el botón de Webpay → volver a la página de recuperación →
   "Intentar pagar nuevamente" → debe ir a Webpay con un **token nuevo** (no bucle).
2. Dejar vencer el **timeout** → misma recuperación → retry con token nuevo.
3. Pago **rechazado** → retry → confirmar correctamente (caso que ya funcionaba, no debe regresar).
4. Doble clic en "Pagar con Webpay" en el checkout → no debe duplicar transacciones (ventana de gracia).

---

## 9. Casos cubiertos y límites

| Caso | Cubierto por | Resultado |
|---|---|---|
| REJECTED | (ya funcionaba) | Retry crea tx nueva ✅ |
| ABORTED intencional | Paso 2 (notificación TBK_TOKEN) + Paso 1 | Tx `ABORTADA`, retry crea tx nueva ✅ |
| TIMEOUT | Paso 1 (ventana de gracia) | Tx `TIMEOUT`, retry crea tx nueva ✅ |
| INICIADA huérfana (cliente cerró la pestaña) | Paso 1 | Se marca `TIMEOUT` en el siguiente retry ✅ |
| Doble clic en checkout | Ventana de gracia (2 min) | Reutiliza la misma tx ✅ |

**Límites / a decidir en equipo:**
- `VENTANA_REUTILIZAR_INICIADA` (2 min) es un umbral arbitrario; ajustar si el doble envío real
  necesita más/menos holgura.
- Si se prefiere **cero cambios en frontend**, aplicar la **Opción 2**: en `iniciar()`, marcar
  **siempre** la `INICIADA` existente como terminal y crear nueva (elimina la reutilización; seguro
  porque el frontend ya bloquea doble envío con `processing`/`checkoutCompletedRef` y el único
  re-caller por orden es el retry). Queda documentada como alternativa simple.
- El caso "el cliente nunca vuelve de Webpay y nunca reintenta" deja la orden `PENDIENTE` sin
  transacción nueva (el admin puede cancelarla); **no** se resuelve con este fix.

## 10. Archivos y endpoints involucrados

| Archivo | Líneas clave |
|---|---|
| `backend/.../WebpayService.java` | `iniciar()` 34–77; dedupe 43–50 |
| `backend/.../WebpayTransaccion.java` | `getCreadoAt` (Lombok), `rechazar` 78 |
| `backend/.../WebpayController.java` | `GET /confirmar` 31–38 |
| `backend/.../SecurityConfigurations.java` | `permitAll` de `/api/pagos/webpay/confirmar` (57) |
| `backend/.../db/migration/V21__create_webpay_transacciones.sql` | UNIQUE solo en `token`/`buy_order` |
| `frontend/src/features/checkout/api/paymentGatewayApi.ts` | `confirmarWebpay` 47–61 |
| `frontend/src/features/checkout/api/index.ts` | barrel 10–14 |
| `frontend/src/features/checkout/ui/CheckoutReturn/CheckoutReturn.tsx` | rama `TBK_TOKEN` 112–116 |
