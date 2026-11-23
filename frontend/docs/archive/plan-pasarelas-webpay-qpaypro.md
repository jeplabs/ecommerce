# Plan: WebPay Plus + QPayPro como pasarelas reales

> Plan detallado del frontend para **WebPay Plus** (flujo conceptual + paso a paso): [`PLAN_WEBPAY_FRONTEND.md`](./PLAN_WEBPAY_FRONTEND.md)

## Contexto actual (lo que hay que reemplazar)
Backend solo persiste órdenes con metodoPagoCodigo de texto. No hay PaymentController, ni transacciones, ni webhooks.
Frontend simula el pago en el navegador (paymentApi.processPayment) y crea la orden después.
QPayPro ya está en la UI pero muerto: no está en canContinuePayment, no lo maneja processPayment, y manda código 'STRIPE' al backend. Los forms SimulatedQPayProForm/SimulatedWebpayForm son estáticos.
Ambos métodos son redirect-based (hosted checkout) → la arquitectura de integración es la misma para los dos.
Fase 1 — Backend: fundaciones
1. Credenciales y config

Agregar claves a application-dev.properties / application-prod.properties:
WebPay: TBK_API_KEY_ID (commerce code), TBK_API_KEY_SECRET.
QPayPro: x_login, x_private_key, x_api_secret, x_product_id, moneda.
Clase @ConfigurationProperties con webpay.* y qpaypro.* + PaymentProperties.
2. Dependencias (pom.xml)

WebPay: com.transbank:transbank-sdk (REST).
QPayPro: no hay SDK → usar el WebClient/RestClient de Spring (ya disponible, no agrega dependencia).
3. Persistencia de transacciones

Nueva migración Flyway V21__create_pagos.sql con tabla pagos:
id, orden_id (FK), proveedor (WEBPAY/QPAYPRO), referencia_externa (token_ws / idTrans), buy_order, monto, moneda, estado (INICIADO/AUTORIZADO/RECHAZADO/ANULADO/FALLIDO), codigo_autorizacion, marca_tarjeta, ultimos_4, creado_at, actualizado_at.
Enum EstadoPago, enum ProveedorPago, entidad Pago, PagoRepository.
4. Estado de la orden

Decidir que las órdenes de pasarela se crean en PENDIENTE y pasan a CONFIRMADA solo cuando la pasarela confirma. (Transferencia y contraentrega quedan como están.)
Fase 2 — Backend: servicios por pasarela
5. Interfaz común ProveedorPagoGateway

IniciarTransaccionResponse iniciar(orden, returnUrl) y ConfirmarTransaccionResult confirmar(token/referencia).
Dos implementaciones: WebpayGateway y QpayProGateway → un PaymentService orquestador elige por código de método.
6. WebpayGateway (Transbank)

iniciar: WebpayPlus.createTransaction(buyOrder, sessionId, montoCLP, returnUrl) → guarda Pago(INICIADO) con el token; devuelve url + token_ws.
confirmar: WebpayPlus.commitTransaction(token_ws) → validar buyOrder/monto/VCI contra lo guardado → Pago(AUTORIZADO) + Orden(CONFIRMADA). Guardar codigo_autorizacion, marca y last4 si vienen.
7. QpayProGateway

iniciar: POST https://sandboxpayments.qpaypro.com/checkout/register_transaction_store (producción: https://payments.qpaypro.com/checkout/register_transaction_store) con x_login, x_private_key, x_api_secret, x_company, datos de envío, x_currency_code, x_amount, x_invoice_num (orden), success_url/error_url (con returnUrl). Guarda Pago(INICIADO) con el token devuelto; devuelve la URL de checkout.
confirmar: POST get_transaction_detail (por idTrans o x_fp_sequence) para validar que fue aprobado → Pago(AUTORIZADO) + Orden(CONFIRMADA).
⚠️ No usar el flujo POST /api_v1 que envía datos de tarjeta al servidor (rompe PCI). El hosted checkout es el correcto.
Fase 3 — Backend: controllers y endpoints
8. PaymentController (auth de cliente donde corresponda)

POST /api/pagos/pasarela/iniciar — body { metodoPagoCodigo, ordenId, returnUrl } → responde { urlRedireccion, referencia, buyOrder }.
POST /api/pagos/pasarela/webpay/confirmar — body { token_ws } → confirma y responde resultado + datos de la orden.
POST /api/pagos/pasarela/qpaypro/confirmar — body { idTrans } (o x_fp_sequence).
9. Webhooks (recomendado, fase avanzada)

POST /api/webhooks/webpay y POST /api/webhooks/qpaypro públicos, con validación de firma; actualizan el estado del pago. Es la forma robusta de enterarse del resultado en producción, además del redirect.
Fase 4 — Backend: flujo de creación de orden
10. Reordenar el flujo para pasarela

Opción recomendada: POST /api/ordenes crea la orden PENDIENTE (misma lógica actual) → frontend llama iniciar con esa ordenId → al confirmar, el backend la pasa a CONFIRMADA.
El monto/cobro siempre se toma de la orden en BD, nunca del request, para no confiar en el frontend.
11. Catálogo de métodos

QPAYPRO no existe en el seed V16 de metodos_pago. Agregar migración/seed con QPAYPRO (tipo PASARELA) y asegurar que WEBPAY ya quede activo.
Fase 5 — Frontend: infraestructura
12. Schemas

Agregar QPAYPRO a metodoPagoSchema y metodoPagoCodigoSchema (WEBPAY ya existe). Arreglar el fallback actual que manda 'STRIPE'.
13. Nueva capa API paymentGatewayApi

iniciarPasarela({ metodoPagoCodigo, ordenId, returnUrl }) → POST /api/pagos/pasarela/iniciar.
confirmarPasarela(...) según proveedor → POST .../confirmar.
paymentApi.processPayment queda obsoleto para pasarela (se puede conservar solo para el caso de pruebas).
14. Tipos nuevos

PaymentInitResult { urlRedireccion, referencia, buyOrder }.
PaymentConfirmResult { estado, codigoAutorizacion?, transactionId?, error? }.
Fase 6 — Frontend: flujo de redirección
15. completeCheckout (useCheckoutLogic)

Para WEBPAY/QPAYPRO: en vez de simular, hacer iniciarPasarela → guardar referencia → window.location.href = urlRedireccion (o window.open, según UX). El usuario paga en la pasarela y vuelve por el returnUrl.
16. Nueva ruta /checkout/retorno (ReturnFromGateway)

Recibe el retorno de la pasarela:
WebPay: ?token_ws=... (GET).
QPayPro: params que QPayPro envía al success_url/error_url.
Llama al confirmar correspondiente → si ok, navega a /checkout/success con { orden, payment }; si falla, pantalla de error con opción de reintentar.
17. Ruta pública del returnUrl

Configurar returnUrl a algo como https://<host>/checkout/retorno?proveedor=webpay. En dev, URL pública vía ngrok.
Fase 7 — Frontend: UI
18. PaymentStep

Mantener botones WebPay y QPayPro. Reemplazar los Simulated*Form estáticos por un resumen del método + botón "Continuar al pago seguro" que dispara la redirección. (Los forms simulados pueden eliminarse o quedar como fallback de demo.)
19. Estados

Loading mientras inicia la pasarela, mensaje de error si falla el inicio, y manejo del regreso desde la pasarela.
20. Confirmación

OrderConfirmationSummary ya muestra payment.provider/transactionId; con la integración real mostrará el codigo_autorizacion devuelto por la pasarela.
Fase 8 — Seguridad
Nunca confiar en el frontend para el monto (el backend lo recalcula de la orden).
Credenciales solo en backend (nunca en .env de Vite).
Confirmar contra la pasarela (server-to-server / get_transaction_detail) antes de marcar la orden CONFIRMADA — no confiar solo en la redirección.
Webhooks con firma para producción.
Fase 9 — Testing
Backend: unit de PaymentService/gateways con mocks, integración H2 con la migración nueva, tests de controllers.
Frontend: MSW fixtures para iniciar/confirmar, tests de useCheckoutLogic espiando window.location, test de la página de retorno (éxito y error).
Fase 10 — Entorno dev
Documentar uso de ngrok (WebPay y QPayPro necesitan URLs públicas para returnUrl/webhooks) y las variables de entorno nuevas.