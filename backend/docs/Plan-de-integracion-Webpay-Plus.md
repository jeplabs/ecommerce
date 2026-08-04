# Plan de integración Webpay Plus

## SDK oficial

Transbank tiene un SDK oficial para Java. La dependencia es com.github.transbankdevelopers:transbank-sdk-java:6.0.0, que es la versión más reciente y usa la API REST moderna.

## Credenciales de integración (desarrollo)

Para el ambiente de integración todos los códigos de comercio usan la misma llave secreta: 579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C. Los SDK tienen preconfiguradas estas credenciales para pruebas.

Las tarjetas de prueba son: VISA que genera transacciones aprobadas, Mastercard que genera transacciones aprobadas, y otras que generan transacciones rechazadas. Cuando aparece el formulario de autenticación se usa RUT 11.111.111-1 y clave 123.

## El flujo completo tiene 3 pasos

Paso 1 — Crear transacción (backend → Transbank)

El cliente confirma la compra. El backend crea la orden en estado PENDIENTE y llama a Transbank enviando el monto, una orden de compra única y la URL de retorno. Transbank recibe buyOrder, sessionId, amount y returnUrl y devuelve un token y una url.

```
POST /api/pagos/webpay/iniciar
  ↓
Backend crea orden PENDIENTE
  ↓
Backend llama WebpayPlus.Transaction.create()
  ↓
Transbank devuelve { token, url }
  ↓
Backend devuelve { token, url } al frontend
```

Paso 2 — Redirigir al formulario de Transbank (frontend)

El frontend debe redirigir al usuario a la URL de Transbank a través de una petición HTTP POST. Es obligatorio que sea mediante POST, lo cual se hace a través de un formulario HTML.

```
Frontend recibe { token, url }
  ↓
Frontend hace POST a url con el token
  ↓
Cliente llena datos de tarjeta en formulario de Transbank
  ↓
Transbank redirige de vuelta al frontend via POST con token_ws
```

Paso 3 — Confirmar transacción (backend → Transbank)

El frontend recibe el token_ws de Transbank y lo envía al backend para confirmar. El SDK se encarga de que al mismo tiempo que se obtiene el resultado de la transacción se haga el acknowledge a Transbank para que no haya posibilidad de que la transacción se revierta.

```
Frontend recibe token_ws de Transbank
  ↓
Frontend llama POST /api/pagos/webpay/confirmar?token_ws=xxx
  ↓
Backend llama WebpayPlus.Transaction.commit(token_ws)
  ↓
Transbank devuelve resultado { responseCode, amount, authorizationCode }
  ↓
Si responseCode == 0 → pago exitoso
  → Orden cambia a CONFIRMADA
  → Email de confirmación al cliente
Si responseCode != 0 → pago rechazado
  → Orden cambia a CANCELADA
  → Stock devuelto
  → Email de rechazo al cliente
Tabla de transacciones en BD
```

Necesitaremos una tabla para registrar cada intento de pago con Webpay:

```
webpay_transacciones
├── id
├── orden_id
├── token                 ← token de Transbank
├── buy_order             ← orden de compra única enviada a Transbank
├── session_id
├── monto
├── estado                ← INICIADA, APROBADA, RECHAZADA, ANULADA
├── response_code         ← 0 = aprobada
├── authorization_code    ← código de autorización del banco
├── card_number           ← últimos 4 dígitos
├── payment_type_code     ← VD=débito, VN=crédito normal, etc.
├── installments          ← número de cuotas
├── creado_at
└── actualizado_at
```

## Endpoints necesarios en el backend

```
POST /api/pagos/webpay/iniciar
  → crea la transacción en Transbank y devuelve token + url

POST /api/pagos/webpay/confirmar
  → recibe token_ws, confirma con Transbank y actualiza la orden

GET  /api/pagos/webpay/estado/{ordenId}
  → consulta el estado de una transacción (para polling del frontend)
```

---

## Casos borde a manejar (dejarlo para una fase 2)

Pago cancelado por el usuario — Transbank redirige de vuelta con TBK_TOKEN y TBK_ORDEN_COMPRA en lugar de token_ws. El backend debe detectar esto y cancelar la orden.

Timeout — Si el usuario demora demasiado, Transbank envía TBK_TOKEN sin token_ws. Mismo tratamiento que cancelación.

Doble confirmación — Si el frontend llama dos veces a confirmar con el mismo token, Transbank rechaza la segunda. El backend debe verificar que la transacción no esté ya confirmada.

Anulación — Transbank permite anular una transacción dentro de cierto plazo. Se implementaría como un endpoint de admin.

---

## Configuración por ambiente

``` 
properties
# Dev - credenciales de integración incluidas en el SDK
api.webpay.ambiente=integracion

# Prod - credenciales reales del comercio
api.webpay.ambiente=produccion
api.webpay.commerce-code=tu_codigo_comercio
api.webpay.api-key=tu_api_key
```

## Lo que NO cambia del sistema actual

La orden se sigue creando igual con POST /api/ordenes. La diferencia es que cuando metodoPagoCodigo = "WEBPAY", el frontend llama adicionalmente a POST /api/pagos/webpay/iniciar con el ordenId para iniciar el flujo de pago.