
# Prueba desde Insomnia

El flujo tiene 3 pasos. Necesitas tener una orden en estado **PENDIENTE** con `metodoPagoCodigo = "WEBPAY"`.

---

## Paso 1 — Crear orden con Webpay

```http
POST /api/ordenes
Header: Authorization: Bearer <token_customer>
```

**Body:**
```json
{
    "direccionId": 1,
    "servicioEnvioId": 1,
    "formaPagoEnvio": "EN_LINEA",
    "metodoPagoCodigo": "WEBPAY",
    "notas": null
}
```
> 💡 **Nota:** Guarda el `id` de la orden que devuelve la respuesta para usarlo en los siguientes pasos.

---

## Paso 2 — Iniciar transacción Webpay

```http
POST /api/pagos/webpay/iniciar
Header: Authorization: Bearer <token_customer>
```

**Body:**
```json
{
    "ordenId": 14
}
```

**Respuesta esperada:**
```json
{
    "token": "e9d555262db0f989e49d587...",
    "url": "https://webpay3gint.transbank.cl/webpayserver/initTransaction"
}
```

---

## Paso 3 — Simular el retorno de Transbank

En un ambiente real el browser haría el POST automáticamente. Desde Insomnia simulas el retorno así:

**Si el pago fue exitoso:**
```http
GET /api/pagos/webpay/confirmar?token_ws=e9d555262db0f989e49d587...
```

**Si el usuario abortó:**
```http
GET /api/pagos/webpay/confirmar?TBK_TOKEN=e9d555262db0f989e49d587...
```

**Respuesta exitosa esperada:**
```json
{
    "success": true,
    "orden": {
        "id": 14,
        "estado": "CONFIRMADA"
    },
    "payment": {
        "transactionId": "ORD-14-abc123",
        "authorizationCode": "1213",
        "amount": 1900.00,
        "cardNumber": "6623",
        "paymentTypeCode": "VN",
        "installments": 0
    },
    "error": null,
    "motivo": null
}
```

**Respuesta abortada esperada:**
```json
{
    "success": false,
    "orden": null,
    "payment": null,
    "error": "No completaste el pago",
    "motivo": "ABORTED"
}
```

---

## Verificar estado en cualquier momento

```http
GET /api/pagos/webpay/estado/14
Header: Authorization: Bearer <token_customer>
```

---

## ⚠️ Importante sobre el Paso 3

En el ambiente de integración de Transbank **no puedes hacer el pago real** desde Insomnia porque necesitas el navegador para el formulario de tarjeta. Lo que sí puedes probar desde Insomnia es:

1. Que el **Paso 2** devuelva `token` y `url` correctamente.
2. Que el confirmar con un token falso devuelva error claro.
3. Que el confirmar con `TBK_TOKEN` devuelva `ABORTED` correctamente.

> 🚧 **Para probar el flujo completo:** incluyendo el formulario de pago, necesitas el frontend o usar `curl` para hacer el POST al formulario de Transbank y seguir la redirección.