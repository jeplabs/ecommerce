# Plan de Implementación: QPayPro Backend

## Descripción del Objetivo
Integrar la pasarela de pago **QPayPro (Guatemala)** en el backend, brindando soporte para pagos en Quetzales (GTQ) o Dólares (USD). El plan considera las funcionalidades disponibles en la [API oficial](https://developers.qpaypro.com/) para generar cobros seguros, procesar confirmaciones y manejar anulaciones/reembolsos, acoplándose al flujo de órdenes existente.

## ⚠️ Revisión Requerida y Preguntas Abiertas

> [!IMPORTANT]
> **Modelo de Integración:** QPayPro ofrece "Pago Directo API" (donde el ecommerce maneja los números de tarjeta) y "Checkout Alojado" (donde el sistema redirige a una página segura de QPayPro mediante un Token). **Se recomienda fuertemente implementar el Checkout Alojado** para no incurrir en auditorías estrictas de certificación PCI-DSS (mismo patrón que usamos con Webpay). ¿Estás de acuerdo con priorizar el modelo de Checkout Alojado?

> [!TIP]
> **Visa en Cuotas:** La pasarela soporta Visa en Cuotas (parámetro `x_visacuotas`). ¿Deseas que habilitaremos el pago en cuotas dinámicamente desde el frontend, o que quede por defecto deshabilitado (`"no"`)?

> [!NOTE]
> **QpayFel (Facturación Electrónica):** La API expone servicios para emitir facturas FEL de Guatemala automáticamente tras el cobro (`/checkout/qpayfel/facturar`). ¿Dejamos esto fuera de alcance por el momento o deseas que la incluyamos en esta fase?

---

## Cambios Propuestos

### 1. Variables de Configuración
Se agregarán las llaves necesarias en los environments (`application.properties` y `application-dev.properties.example`).
#### [MODIFY] `application-dev.properties.example`
```properties
qpaypro.api.login=visanetgt_qpay
qpaypro.api.key=88888888888
qpaypro.api.secret=99999999999
qpaypro.api.url=https://api-sandboxpayments.qpaypro.com/checkout
qpaypro.api.store-url=https://sandboxpayments.qpaypro.com/checkout/store?token=
qpaypro.api.webhook-secret=MI_SECRETO_PARA_FIRMAS
```

---

### 2. Capa de Dominio de QPayPro
Paquete base: `com.jeplabs.ecommerce.domain.pago.qpaypro`
Esta capa registrará la trazabilidad de cada intento de pago, sirviendo como historial de auditoría.

#### [NEW] `QPayProTransaccion.java`
Entidad JPA equivalente a `WebpayTransaccion`.  
**Atributos:** `id`, `orden_id` (FK), `token` (token de la sesión), `transaction_id` (retornado por QPayPro al pagar), `estado` (PENDIENTE, APROBADA, DENEGADA, ANULADA), `monto`, `md5_hash_response`, `creadoAt`.

#### [NEW] `EstadoQPayPro.java`
Enum con los estados de la transacción mencionados arriba.

#### [NEW] `QPayProTransaccionRepository.java`
Operaciones:
- `Optional<QPayProTransaccion> findByOrdenIdAndEstado(Long ordenId, EstadoQPayPro estado)`
- `Optional<QPayProTransaccion> findByToken(String token)`

---

### 3. Capa de Servicios
Paquete base: `com.jeplabs.ecommerce.domain.pago.qpaypro`

#### [NEW] `QPayProService.java`
Implementará la comunicación HTTP (vía `RestTemplate`) a los endpoints identificados de la API de QPayPro:
1. **`iniciarPago(Orden orden)`**:
   - URL: `POST /register_transaction_store`
   - Payload: Mapea la información del usuario (`x_first_name`, `x_last_name`, `x_email`), información de facturación y el `x_amount` de la orden, estableciendo `x_relay_url` hacia nuestro backend.
   - Retorno: `String` con la URL de redirección: `qpaypro.api.store-url + {token}`.
2. **`confirmarPago(Map<String, String> response)`**:
   - Se ejecuta cuando QPayPro redirige al usuario de vuelta (vía GET).
   - Valida la integridad verificando que la firma `x_MD5_Hash` recibida coincida con el cálculo local (Monto + Transaction ID + Secret).
   - Actualiza el estado de la transacción y, si fue aprobada, cambia el `EstadoOrden` a `CONFIRMADA`.
3. **`anularPago(Long ordenId)`**:
   - URL: `POST /void_transaction`
   - Ejecutado desde el admin (reembolsos). Envía el `x_trans_id` para deshacer el cobro en QPayPro y devuelve el stock mediante `OrdenService`.
4. **`consultarEstado(Long ordenId)`**:
   - URL: `POST /get_transaction_detail`
   - Recupera el estado real del pago en los servidores de QPayPro (usado para control de huérfanos).

---

### 4. Capa de Controladores
Paquete: `com.jeplabs.ecommerce.controller`

#### [NEW] `QPayProController.java`
Rutas para ser consumidas por la App o QPayPro:
- `POST /api/pagos/qpaypro/{ordenId}/iniciar`: Genera el link de pago y lo devuelve al frontend.
- `GET /api/pagos/qpaypro/retorno`: Es el `x_relay_url` donde aterriza el cliente después del pago. Recibe los `Query Params` (ej. `x_response_status`, `x_trans_id`), llama a confirmarPago, y redirige al frontend (pantalla de éxito/error).
- `POST /api/pagos/qpaypro/{ordenId}/anular`: Endpoint interno (Admin) para reembolsos.

---

### 5. Integración con Expiración Automática
#### [MODIFY] `OrdenExpiracionScheduler.java` (Opcional si se comparte)
Debe modificarse el método `noHayPagoAprobado` para que, si el método de pago seleccionado es QPayPro, consulte el método `qpayproService.consultarEstado()` antes de cancelar la orden (evitando reembolsar stock de una orden que sí fue pagada pero el usuario no volvió de QPayPro).

---

## Verificación del Plan

### Pruebas Automatizadas
1. **Mock QPayPro API:** Se creará un `QPayProServiceTest` donde `RestTemplate` interceptará las llamadas y devolverá JSON predefinidos simulando las respuestas de éxito (`{"estado": "success", "data": {"token": "123"}}`).
2. Se testeará la generación manual de la firma MD5 para corroborar el interceptor de seguridad.
3. Se correrá la suite: `.\mvnw.cmd clean test -q`.

### Verificación Manual
1. Generar una orden (PENDIENTE).
2. Llamar a `/api/pagos/qpaypro/{ordenId}/iniciar` desde Postman/Swagger y confirmar que devuelve la URL estructurada con el token.
3. Simular el retorno manual de QPayPro llamando al endpoint `/api/pagos/qpaypro/retorno?x_response_status=1&x_trans_id=9999&x_amount=...&x_MD5_Hash=...` verificando que confirme la orden.
