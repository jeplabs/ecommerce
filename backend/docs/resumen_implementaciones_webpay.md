# Resumen de Implementación - Casos Borde Webpay

A continuación se detalla el trabajo de estabilización, seguridad y lógica de negocio implementado en el backend para resolver los casos borde documentados de la pasarela de pago Webpay Plus.

## Caso 1: Pagos exitosos marcados como TIMEOUT (Pieza B)
**Problema:** Transacciones que efectivamente se cobraron en Transbank quedaban marcadas como TIMEOUT si el usuario cerraba la ventana antes de la redirección al backend.
**Solución Implementada:**
- Modificado el método `iniciar()` en `WebpayService.java`.
- Antes de descartar una transacción en estado `INICIADA` como `TIMEOUT` por tiempo (más de 10 minutos), el sistema consulta su estado real hacia Transbank mediante `verificarYActualizarEstadoTransaccion()`.
- Si se detecta que la transacción en realidad está `APROBADA`, se bloquea el intento de crear una nueva, arrojando una excepción y evitando que se aplique un cobro duplicado al usuario.

## Caso 2: Seguridad del Webhook (Sin validación de secreto)
**Problema:** El endpoint público del Webhook era vulnerable a que un atacante inyectara peticiones falsas para dar órdenes por pagadas, ya que no validaba el secreto de autorización de Transbank.
**Solución Implementada:**
- Se inyectó la validación del header `X-Webhook-Secret` en el método `webhook()` de `WebpayController.java`.
- Se añadieron las variables de configuración en `application-test.properties` y `application-dev.properties.example` (`api.webpay.webhook-secret`).
- El endpoint ahora retorna `401 Unauthorized` ante cualquier petición que no traiga el secreto exacto.

## Caso 7: Validar monto del Commit de Transbank
**Problema:** Al confirmar un pago, el sistema no validaba que el dinero cobrado por Transbank fuera exactamente el monto adeudado en la orden. 
**Solución Implementada:**
- Se añadió una validación rigurosa en `procesarAprobada` y `procesarAprobadaStatus` (`WebpayService.java`).
- El monto reportado por Transbank (`response.getAmount()`) se compara exhaustivamente con el monto original de la orden (`transaccion.getMonto()`).
- En caso de una discrepancia, la transacción es rechazada automáticamente previniendo el envío de productos con pagos parciales o manipulados.

## Caso 4: Expiración de órdenes PENDIENTES (Retención de Stock)
**Problema:** Las órdenes que quedaban en estado `PENDIENTE` sin ser pagadas jamás devolvían su stock reservado al inventario, provocando un desabastecimiento artificial.
**Solución Implementada:**
- Se añadió el método `findByEstadoAndCreadoAtBefore` en `OrdenRepository.java`.
- Se creó la tarea programada `OrdenExpiracionScheduler.java`, que rastrea cada 5 minutos órdenes que lleven más de 10 minutos (ambos valores parametrizables) en estado `PENDIENTE`.
- Previo a cancelar cada orden, el Scheduler **verifica en tiempo real con Webpay** que no haya un pago confirmado para dicha orden. Si no hay pago, la cancela (`OrdenService.expiracionAutomatica`) y libera los productos nuevamente al stock disponible.

## Caso 3: Reembolsos de órdenes CONFIRMADAS (Flujo de Refund)
**Problema:** Si el usuario cancelaba una orden que ya estaba pagada (`CONFIRMADA`), el stock se devolvía al inventario de inmediato, pero el dinero no se reembolsaba ni quedaba constancia del proceso manual requerido.
**Solución Implementada:**
- Se crearon los nuevos estados `ANULADO` y `REEMBOLSADO` en la entidad `EstadoOrden`, y `REEMBOLSADA` en `EstadoWebpayTransaccion`.
- Se modificó `cancelarMiOrden()` (`OrdenService.java`) para que si el cliente cancela una orden ya pagada, esta pase a estado `ANULADO` (en espera) **sin liberar el stock**.
- Se implementó el método `reembolsar(Long ordenId)` en `WebpayService.java` que ejecuta un _Refund_ directo a las APIs de Transbank.
- Se habilitó un nuevo endpoint de Admin `POST /api/pagos/webpay/{ordenId}/reembolsar` que coordina el reembolso y luego llama a `completarReembolso()` para retornar los productos al inventario.

## Casos Diferidos / Resueltos Previamente
- **Caso 6 (Retorno POST vs GET):** Quedó diferido, ya que el código base actual de `WebpayController` ya expone endpoints GET y POST (`/confirmar`) capaces de recibir e interpretar los parámetros correctamente según envíe el frontend/Transbank.
- **Caso 5 y Caso 8:** Fueron solucionados estructuralmente con las mejoras abordadas en la implementación de Reconciliación y Timeouts previas (Literal 4 original).

> **Nota Adicional:** Toda la refactorización fue comprobada ejecutando repetidas veces la Suite de Pruebas Unitarias de Maven (`mvnw clean test`), garantizando que se cumplen las reglas de negocio sin introducir regresiones ni errores compilables en el sistema existente (100% Pasaron - *Exited with code 0*).
