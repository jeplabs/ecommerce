# Webpay Plus — Ajustes al contrato Frontend ↔ Backend

> Complementa a [`Plan-de-integracion-Webpay-Plus.md`](./Plan-de-integracion-Webpay-Plus.md).
> **Solo incluye ajustes que NO están contemplados en ese plan.** Todo lo demás queda como está.

---

## 1. `POST /api/pagos/webpay/confirmar` — la respuesta debe incluir la orden completa

El plan actual devuelve solo campos crudos de Transbank (`responseCode`, `amount`, `authorizationCode`). **Requerido:** incluir la `OrderApi` confirmada + datos del pago en la misma respuesta:

```
POST /api/pagos/webpay/confirmar
  body: { token_ws: string }
  resp:
    success → { success: true, orden: OrderApi, payment: { transactionId, authorizationCode, amount } }
    failure → { success: false, error: string, motivo: 'ABORTED' | 'TIMEOUT' | 'REJECTED' }
```

**Motivo:** el frontend necesita la orden para la pantalla de éxito. Sin ella, debe hacer un GET adicional (un round-trip innecesario).

**Aclaración — ¿qué es la `OrderApi`?** Es el mismo DTO de orden que el backend ya devuelve al crear una orden (`DatosRespuestaOrden` / `POST /api/ordenes`), es decir la **orden completa ya confirmada** (`estado = CONFIRMADA`), no un resumen. Debe incluir:

- `id`, `estado` (`CONFIRMADA`)
- `direccionId`, `direccionEnvio` (snapshot de la dirección)
- `servicioEnvio`, `formaPagoEnvio`, `metodoPago` (`WEBPAY`), `metodoPagoNombre`, `tipoMetodoPago` (`PASARELA`)
- `items` (producto, sku, cantidad, precios, IVA, subtotal por item)
- `subtotal`, `iva`, `costoEnvio`, `notaEnvio`, `total`
- `notas`, `creadoAt`, `actualizadoAt`

En resumen: la misma estructura que el frontend ya consume en toda la app de órdenes; simplemente llega dentro de la respuesta del `confirmar` en lugar de tener que pedirla por GET.

## 2. Idempotencia del `confirmar` — desde el día 1, no en fase 2

El plan la deja en "casos borde, fase 2" (doble confirmación). **Requerido en el camino feliz:** la página de retorno reenvía el confirm automáticamente; si el usuario refresca, se dispara un segundo POST con el mismo `token_ws`. Transbank solo acepta el primer `commit`.

Comportamiento esperado, antes de llamar a `commit(token_ws)`:

| Estado en `webpay_transacciones` | Comportamiento |
|---|---|
| `APROBADA` | Devolver el mismo resultado exitoso guardado (orden + payment), **sin** llamar de nuevo a Transbank |
| `INICIADA` | Proceder con `commit` normalmente |
| Estado terminal de rechazo | Devolver el resultado de rechazo |

## 3. Retorno por GET además de POST

El plan asume que Transbank redirige al comercio **solo por POST**. Según la documentación oficial de Transbank, en API 1.1+ el **retorno normal llega por GET** con `token_ws` en la URL (el POST queda solo para el caso abortado en ambiente de integración).

**Requerido:** el `confirmar` debe poder leer el `token_ws` tanto de query param como de body.

## 4. Respuesta de rechazo con `motivo`

Incluir `motivo` además de `error`, para que el frontend distinga el mensaje:
- `ABORTED` → "No completaste el pago".
- `TIMEOUT` → "Se agotó el tiempo en Webpay".
- `REJECTED` → "Tu tarjeta fue rechazada".

## 5. Monto siempre desde la BD

El frontend **no envía el monto en ningún paso**. El `create` y las validaciones del `commit` deben usar el `total` guardado en la orden al crearla. Confirmar que no se reciba ni confíe en un monto proveniente del request.

---

## Fase 2 (referencia, no bloquea el camino feliz)

- **`iniciar` re-llamable** — evitar crear transacciones Transbank duplicadas para la misma orden ante doble clic o retry de red.
- **Webhook de Transbank** — para producción; sincroniza el estado si el usuario cierra el navegador antes del retorno.
