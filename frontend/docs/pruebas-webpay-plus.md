# Pruebas de Webpay Plus (Transbank) — guía para el equipo

Guía para probar la **integración real** de Webpay Plus directamente desde el frontend (no Insomnia).
La pasarela es de tipo *redirect*: el cliente sale de la tienda, paga en el formulario de Transbank y
vuelve a la URL de retorno del frontend.

> ✅ Estado: **implementado de punta a punta**. Backend (`10e4635`) + frontend ya conectados.
> La prueba feliz con **Redcompra débito** ya se validó y deja la orden en estado **CONFIRMADA**.

---

## 1. Requisitos

| Requisito | Detalle |
|-----------|---------|
| Backend corriendo | Puerto `8081` (config en `application-dev.properties`) con perfil `dev` |
| `application-dev.properties` | Debe existir con el bloque `api.webpay.*` (ver §2) |
| Frontend corriendo | `VITE_API_URL` apuntando al backend, p.ej. `http://localhost:8081` |
| Base de datos | Migraciones aplicadas (Flyway crea `webpay_transacciones` en `V21`) |
| Usuario | Cuenta **customer** registrada y con dirección de envío |

> 💡 **No necesitas cuenta dev de Transbank.** En ambiente `integracion` el SDK usa las
> credenciales de prueba embebidas (`WebpayConfig.java`). Solo para **producción** se necesitan
> `commerce-code` y `api-key` reales.

---

## 2. Configuración relevante

Bloque en `backend/src/main/resources/application-dev.properties`:

```properties
api.webpay.ambiente=integracion
api.webpay.commerce-code=
api.webpay.api-key=
api.webpay.return-url=http://localhost:5173/checkout/webpay/retorno
api.webpay.webhook-secret=SECRET_WEBHOOK
```

| Clave | Valor esperado en dev |
|-------|----------------------|
| `api.webpay.ambiente` | `integracion` (o `produccion` en producción) |
| `api.webpay.commerce-code` | **Vacío** en integración (obligatorio solo en producción) |
| `api.webpay.api-key` | **Vacío** en integración (obligatorio solo en producción) |
| `api.webpay.return-url` | Debe ser la ruta SPA que existe: `http://localhost:5173/checkout/webpay/retorno` |
| `api.webpay.webhook-secret` | Solo aplica en producción (webhook) |

> ⚠️ La `return-url` es la única fuente de verdad del retorno (el `returnUrl` que manda el frontend
> en el body lo ignora el backend). Debe coincidir con una ruta registrada en `AppRouter.tsx`.

---

## 3. Flujo paso a paso desde el frontend

1. **Inicia sesión** como cliente (`ROLE_CUSTOMER`).
2. Agrega productos al **carrito**.
3. Entra a `/checkout` → completa **dirección** y **envío**.
4. En el paso de pago selecciona **Webpay Plus** (verás: *«Serás redirigido al sitio seguro de
   Webpay Plus (Transbank) para completar el pago»*).
5. **Confirma el pedido** → la orden se crea en `PENDIENTE` y el navegador redirige al formulario
   de Transbank (`https://webpay3gint.transbank.cl/...`).
6. Ingresa una **tarjeta de prueba** (§4). Si aparece el formulario del banco, usa
   **RUT `11.111.111-1`** y **clave `123`**.
7. Al terminar, Transbank redirige a `http://localhost:5173/checkout/webpay/retorno` con
   `token_ws` (aprobado/rechazado) o `TBK_TOKEN` (abortado).
8. El frontend confirma (`POST /api/pagos/webpay/confirmar`) y muestra el resultado.

**Cierre automático por polling:** mientras la orden queda `PENDIENTE`, el frontend consulta
`GET /api/pagos/webpay/estado/{ordenId}` (backoff `2s→5s→15s→30s`, pausado mientras la pestaña esté
oculta, deadline 5 min). Si la transacción llegó a `APROBADA` pero el retorno con `token_ws` no se
procesó (p.ej. cerraste la pestaña de Transbank o volviste manualmente a la pestaña de la tienda),
el checkout la completa solo y redirige a `/checkout/success`.

**Dónde verificar el resultado:**

| Dónde | Ruta |
|-------|------|
| Confirmación de compra | `/checkout/success` |
| Historial del cliente | `/profile` → pestaña **Mis pedidos** (`/profile/ordenes`) |
| Admin | `/admin/orders` |

---

## 4. Tarjetas de prueba (oficiales Transbank, ambiente integración)

| Tipo | Número | CVV | Expiración | Resultado |
|------|--------|-----|------------|-----------|
| VISA (crédito) | `4051 8856 0044 6623` | `123` | cualquier fecha futura | ✅ Aprobada |
| AMEX | `3700 0000 0002 032` | `1234` | cualquier fecha futura | ✅ Aprobada |
| MasterCard | `5186 0595 5959 0568` | `123` | cualquier fecha futura | ❌ Rechazada |
| Redcompra (débito) | `4051 8842 3993 7763` | — | — | ✅ Aprobada |
| Redcompra (débito) | `4511 3466 6003 7060` | — | — | ✅ Aprobada |
| Redcompra (débito) | `5186 0085 4123 3829` | — | — | ❌ Rechazada |
| Prepago VISA | `4051 8860 0005 6590` | `123` | cualquier fecha futura | ✅ Aprobada |
| Prepago MasterCard | `5186 1741 1062 9480` | `123` | cualquier fecha futura | ❌ Rechazada |

**Autenticación del banco:** si aparece el formulario de autenticación, usar
**RUT `11.111.111-1`** y **clave `123`**.

> 💡 **Validado en el proyecto:** Redcompra débito `4051 8842 3993 7763` deja la orden
> `CONFIRMADA` en el historial.

> ⚠️ **Error común:** `4051 8856 0044 6623` (VISA **crédito**) y `4051 8842 3993 7763`
> (Redcompra **débito**) son tarjetas distintas. Si usas el número de débito esperando «VISA»,
> el resultado puede diferir del esperado. Verifica el número completo.

---

## 5. Resultados esperados por escenario

| Escenario | Tarjeta / acción | Pantalla en retorno | Orden en historial |
|-----------|------------------|---------------------|--------------------|
| Pago aprobado | VISA o Redcompra éxito | `/checkout/success` con datos del pago | `CONFIRMADA` |
| Pago rechazado | MasterCard o Redcompra rechazo | «Pago rechazado» | `PENDIENTE` (hoy) |
| Usuario anula | Botón **Anular compra** en el formulario | «Pago no completado» | `PENDIENTE` (hoy) |
| Timeout | Dejar el formulario sin pagar (~10 min integración) | «Se agotó el tiempo» | `PENDIENTE` (hoy) |

> 📌 **Comportamiento actual del backend:** la orden se crea en `PENDIENTE` **antes** del pago
> (por diseño). El backend registra la transacción Webpay (aprobada/rechazada/abortada), pero **no**
> cambia la orden a un estado de «rechazada» ni la elimina. Por eso las órdenes no aprobadas
> quedan `PENDIENTE` en el historial del cliente.

### Posibles mejoras (siguiente iteración)

Opciones para ordenar ese comportamiento (aún no implementadas):

**Sobre el estado de la orden:**
- **[Estado REJECTED]** Marcar la orden como `RECHAZADA`/`FALLIDA` cuando la transacción se
  aprueba como rechazo, aborta o expira (en `WebpayService.confirmar`).
- **[Limpieza por tiempo]** Eliminar (o marcar) las órdenes `PENDIENTE` con transacción fallida
  después de un tiempo (`@Scheduled`).
- **[Reintento]** Permitir al cliente volver a pagar una orden `PENDIENTE` desde su historial
  (o desde la pantalla de rechazo).

**Sobre el carrito vacío tras un pago fallido:**
Cuando el pago es rechazado/abortado y el cliente pulsa «Volver al checkout», el **carrito ya está
vacío** porque la orden se crea (y el carrito se consume) en `POST /api/ordenes`, **antes** de la
confirmación de Transbank (`OrdenService` borra los items del carrito). Además, la respuesta de
fallo del backend trae `orden: null`, así que hoy el frontend no tiene datos para reconstruirlo.
Opciones:

- **[Restaurar carrito al fallar (frontend)]** Guardar el snapshot del carrito
  (`productoId` + `cantidad`) en `sessionStorage` antes de redirigir a Transbank; en
  `CheckoutReturn`, si el resultado falla (rechazado/abortado/timeout), restaurarlo con
  `addToCart()`. Sin cambios de backend. *Caveat:* si el usuario cierra la pestaña se pierde.
- **[Backend devuelve la orden en el fallo]** Que `DatosRespuestaConfirmarWebpay.fallido()` incluya
  la `DatosRespuestaOrden` (sus `items` ya traen `productoId` y `cantidad`). El frontend reconstruye
  el carrito desde `result.orden.items` sin snapshot, y habilita además el **[Reintento]**.
- **[No consumir el carrito hasta confirmar]** Refactor de backend (la opción «correcta» a largo
  plazo): crear la orden definitiva solo tras `commit` exitoso, o reservar stock con expiración.
  Ya está sugerido en [`payment-gateways.md`](./payment-gateways.md) (checklist Webpay y
  «Orden de operaciones recomendada»).

---

## 6. Troubleshooting

| Síntoma | Causa probable / solución |
|---------|---------------------------|
| `401` al confirmar el pedido Webpay | Sesión JWT expirada (dura 5 h en dev). Vuelve a iniciar sesión. |
| `404`/`400` en `/iniciar` | La orden no existe, no pertenece al usuario o no está `PENDIENTE`. |
| Pantalla en blanco al volver de Transbank | La `return-url` no coincide con una ruta SPA. Debe ser `/checkout/webpay/retorno`. |
| «Retorno de Webpay inválido: faltan datos» | Se llegó a la ruta de retorno sin `token_ws`/`TBK_TOKEN` (p.ej. navegando directo). |
| Error al crear la transacción con pedidos mínimos | Transbank exige un monto mínimo en integración; prueba con un carrito de monto mayor. |
| La tarjeta «VISA» no aprueba | Verifica el número: VISA crédito es `4051 8856 0044 6623` (no la de débito). |
| Quiero verificar el estado de una transacción | `GET /api/pagos/webpay/estado/{ordenId}` (ver doc backend de Insomnia). |

---

## 7. Referencias

- **Backend (Insomnia):** [`backend/docs/Pruebas-pasarela-Webpay-Plus.md`](../../backend/docs/Pruebas-pasarela-Webpay-Plus.md)
- **Documentación oficial:** [Transbank Developers — Webpay Plus](https://www.transbankdevelopers.cl/documentacion/webpay-plus)
- **Tarjetas de prueba oficiales:** [Transbank Developers — Cómo empezar](https://www.transbankdevelopers.cl/documentacion/como_empezar)

**Archivos del frontend involucrados:**

| Archivo | Rol |
|---------|-----|
| `features/checkout/api/paymentGatewayApi.ts` | `iniciarWebpay()`, `confirmarWebpay()` (POST `/iniciar` y `/confirmar`) y `consultarEstadoWebpay()` (GET `/estado/{ordenId}`) |
| `features/checkout/model/useCheckoutLogic.ts` | Crea la orden y redirige a Transbank |
| `features/checkout/model/schemas/payment.ts` | Schemas Zod (`webpayInitResponseSchema`, `webpayConfirmResponseSchema`) |
| `features/checkout/ui/CheckoutReturn/CheckoutReturn.tsx` | Procesa el retorno (`token_ws`, `TBK_TOKEN`, `TBK_ORDEN_COMPRA`) |
| `app/router/AppRouter.tsx` | Ruta de retorno por pasarela: `/checkout/webpay/retorno` |

---

## 8. Cobertura automatizada

> ✅ El flujo **Webpay Plus del frontend está a alta cobertura** en Vitest
> (`features/checkout/api/paymentApi.ts`, `features/checkout/api/paymentGatewayApi.ts`,
> `CheckoutReturn`, `SimulatedWebpayForm`, `useCheckoutLogic` en su rama Webpay y el polling de
> `estado`), dentro del alcance de la
> [Fase 7 de `testing.md`](./testing.md#fase-7--checkout-ui-webpay-plus-y-cobertura-al-100--cerrada).

Además de las pruebas manuales de esta guía (con tarjetas de prueba de Transbank en ambiente
`integracion`), el flujo de Webpay tiene cobertura automatizada:

- **`features/checkout/api/paymentApi.test.ts`** — `iniciarWebpay`, `confirmarWebpay` ok y fallo
  (`token_ws`), tope de pago.
- **`features/checkout/api/paymentGatewayApi.test.ts`** — `iniciarWebpay`, `confirmarWebpay`,
  notificar abortada/timeout y `consultarEstadoWebpay` (estado parseado, 404, schema Zod).
- **`features/checkout/ui/CheckoutReturn/*.test.tsx`** — retorno aprobado (consume `token_ws`),
  rechazado, abortado (`TBK_TOKEN`) y error genérico con reintento.
- **`features/checkout/ui/SimulatedWebpayForm/*.test.tsx`** — formulario simulado (demo) con
  redirección y cancelación.
- **`features/checkout/lib/payment-methods.test.ts`** — WebPay solo se ofrece en CL (y QPayPro solo
  en GT); esto protege la regla de negocio por país.
- **`features/checkout/model/useCheckoutLogic.test.tsx`** — la rama Webpay del hook que crea la orden
  y prepara la redirección.
- **`features/checkout/model/useCheckoutLogic.polling.test.tsx`** — polling de `GET /estado/{ordenId}`
  con backoff (`2s→5s→15s→30s`) y pausa/reanudación por visibilidad de pestaña; una transacción
  `APROBADA` descubierta por polling completa la orden (limpia el pendiente y navega a `/checkout/success`).

Cualquier cambio en los archivos listados arriba queda bajo el umbral de cobertura de
`vite.config.ts` (lines/statements 90 %, branches 85 %), así que una regresión de estas pruebas
rompe `pnpm test:coverage`.
