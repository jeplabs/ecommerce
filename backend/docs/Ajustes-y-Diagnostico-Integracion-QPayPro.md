# Documentación Técnica: Ajustes y Diagnóstico de Integración QPayPro (Backend)

Este documento registra en detalle todos los hallazgos técnicos, ajustes de seguridad, errores de integración detectados y las mejores prácticas aplicadas en el backend (Spring Boot) durante la integración de la pasarela de pago **QPayPro (Guatemala)**.

---

## 📋 Índice
1. [Migración Flyway para el Método de Pago `QPAYPRO`](#1-migración-flyway-para-el-método-de-pago-qpaypro)
2. [Configuración de Seguridad y CORS (`SecurityConfigurations.java`)](#2-configuración-de-seguridad-y-cors-securityconfigurationsjava)
3. [Desacoplamiento del Puerto del Frontend (`QPayProController.java`)](#3-desacoplamiento-del-puerto-del-frontend-qpayprocontrollerjava)
4. [Diagnóstico de Excepción HTTP 401 (Gateway Externo vs JWT)](#4-diagnóstico-de-excepción-http-401-gateway-externo-vs-jwt)
5. [Ajustes en el Payload Requerido por QPayPro (`QPayProService.java`)](#5-ajustes-en-el-payload-requerido-por-qpaypro-qpayproservicejava)

---

## 1. Migración Flyway para el Método de Pago `QPAYPRO`

### Diagnóstico del Problema
Al momento de crear una orden en la API (`POST /api/ordenes`) seleccionando QPayPro, la clase `OrdenService` consulta a `MetodoPagoService.buscarPorCodigo("QPAYPRO")` para validar que el método de pago existe y se encuentra activo en la base de datos.

En la migración original `V16__create_metodos_pago.sql` solo se insertaron los códigos: `STRIPE`, `MERCADO_PAGO`, `WEBPAY`, `TRANSFERENCIA` y `CONTRA_ENTREGA`. La migración `V24__create_qpaypro.sql` creó la tabla de transacciones `qpaypro_transacciones`, pero omitió insertar el registro del método de pago en la tabla `metodos_pago`.

Esto provocaba la siguiente excepción al intentar crear la orden:
```
IllegalArgumentException: Método de pago no encontrado: QPAYPRO
```

### Ajuste Realizado
Se creó una nueva migración de base de datos en `backend/src/main/resources/db/migration/`:

**Archivo:** `V25__insert_qpaypro_metodo_pago.sql`
```sql
INSERT INTO metodos_pago (codigo, nombre, descripcion, tipo, activo, orden_visualizacion)
VALUES ('QPAYPRO', 'QPayPro', 'Visa, Mastercard - Guatemala', 'PASARELA', true, 6)
ON CONFLICT (codigo) DO NOTHING;
```

---

## 2. Configuración de Seguridad y CORS (`SecurityConfigurations.java`)

### Diagnóstico del Problema
1. **Bloqueo de Preflight CORS (HTTP `OPTIONS`)**:
   Cuando el cliente en React (`http://localhost:5173`) hace una petición `POST` con cabeceras `Authorization: Bearer <token>` y `Content-Type: application/json` hacia el backend en el puerto `8081`, el navegador envía de forma transparente una verificación previa HTTP `OPTIONS`.
   Las peticiones `OPTIONS` no incluyen la cabecera `Authorization`. Al no estar explícitamente permitidas en `SecurityConfigurations`, la regla por defecto `.anyRequest().authenticated()` las rechazaba respondiendo `401 Unauthorized`.
2. **Bloqueo en Redirecciones de Retorno**:
   QPayPro notifica el resultado redirigiendo el navegador a `/api/pagos/qpaypro/retorno`. Dado que esta petición viene desde un origen externo o sin token JWT de sesión, Spring Security bloqueaba la respuesta si no estaba exonerada explícitamente.

### Ajuste Realizado
Se actualizaron las reglas de la cadena de filtros en `SecurityConfigurations.java`:

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(req -> req
                    // 1. Permitir peticiones preflight CORS (OPTIONS) sin token
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    ...
                    // 2. Permitir endpoints de retorno y estado de QPayPro
                    .requestMatchers("/api/pagos/qpaypro/**").permitAll()
                    .anyRequest().authenticated()
            )
            ...
            .build();
}
```

---

## 3. Desacoplamiento del Puerto del Frontend (`QPayProController.java`)

### Diagnóstico del Problema
En `QPayProController.java`, la URL de redirección final al completar o cancelar la transacción estaba hardcodeada al puerto `3000`:
```java
String frontendUrl = "http://localhost:3000/checkout/success?orden=" + invoiceNum;
```
En este proyecto, el servidor de desarrollo de Vite corre por defecto en el puerto `5173` (`http://localhost:5173`), lo que causaba redirecciones fallidas hacia un puerto inactivo.

### Ajuste Realizado
1. **Configuración en `application-dev.properties`**:
   ```properties
   # URL base del Frontend (Vite)
   api.frontend.url=http://localhost:5173
   ```
2. **Inyección Dinámica en `QPayProController.java`**:
   ```java
   @RestController
   @RequestMapping("/api/pagos/qpaypro")
   @RequiredArgsConstructor
   public class QPayProController {

       private final QPayProService qpayproService;
       private final OrdenRepository ordenRepository;

       @Value("${api.frontend.url:http://localhost:5173}")
       private String frontendBaseUrl;

       @GetMapping("/retorno")
       public ResponseEntity<String> retornoQPayPro(
               @RequestParam("x_response_status") String responseStatus,
               @RequestParam(value = "x_trans_id", required = false) String transId,
               @RequestParam(value = "x_amount", required = false) String amount,
               @RequestParam(value = "x_MD5_Hash", required = false) String md5Hash,
               @RequestParam("x_invoice_num") String invoiceNum) {

           qpayproService.confirmarPago(responseStatus, transId, amount, md5Hash, invoiceNum);
           
           String frontendUrl = frontendBaseUrl + "/checkout/success?orden=" + invoiceNum;
           if (!"1".equals(responseStatus)) {
               frontendUrl = frontendBaseUrl + "/checkout/error?orden=" + invoiceNum;
           }

           return ResponseEntity.status(302).header("Location", frontendUrl).build();
       }
   }
   ```

---

## 4. Diagnóstico de Excepción HTTP 401 (Gateway Externo vs JWT)

### Análisis del Error
Durante las pruebas de cliente, al presionar "Ir a QPayPro", la consola registraba:
`POST http://localhost:8081/api/pagos/qpaypro/X/iniciar 401 (Unauthorized)`

Esto producía un comportamiento donde la orden se creaba correctamente en la base de datos (HTTP 200), pero inmediatamente después el frontend cerraba la sesión del usuario.

### Causa Raíz Identificada
1. En `QPayProService.java`, el método `iniciarPago` realiza una petición HTTP POST usando `RestTemplate` hacia la pasarela externa:
   `POST https://api-sandboxpayments.qpaypro.com/checkout/register_transaction_store`
2. Dado que las llaves configuradas en `application-dev.properties` (`visanetgt_qpay` / `88888888888`) son credenciales dummy de ejemplo, la pasarela remota de QPayPro responde **HTTP 401 Unauthorized**.
3. El componente `RestTemplate` de Spring interpreta el 401 de QPayPro y lanza una excepción de tipo `HttpClientErrorException.Unauthorized`.
4. Al no capturar específicamente `HttpClientErrorException` en `QPayProService`, Spring Boot **refleja el código de estado 401 del servidor remoto de QPayPro hacia la respuesta HTTP del cliente local**.
5. En el frontend, el cliente HTTP (`http-session.ts`) intercepta cualquier respuesta con código `401` e invalida la sesión JWT (`invalidateClientSession`), cerrando la sesión del usuario.

### Recomendación de Manejo de Excepciones
Para evitar que un rechazo de credenciales en la pasarela remota cierre la sesión del cliente e-commerce, `QPayProService.java` debe envolver la llamada de `RestTemplate` y relanzar el fallo como un error de negocio (`400 Bad Request` / `IllegalArgumentException`):

```java
try {
    ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl + "/register_transaction_store", request, Map.class);
    ...
} catch (HttpClientErrorException e) {
    log.error("La pasarela QPayPro devolvió HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
    throw new IllegalArgumentException("Error devuelto por QPayPro: " + e.getResponseBodyAsString());
} catch (Exception e) {
    log.error("Excepción llamando a QPayPro", e);
    throw new IllegalArgumentException("No se pudo iniciar el pago en QPayPro");
}
```

---

## 5. Ajustes en el Payload Requerido por QPayPro (`QPayProService.java`)

### Estructura de Datos Requerida por la API de QPayPro
De acuerdo a la especificación oficial de la API Hosted Page de QPayPro (`register_transaction_store`), se requieren los siguientes parámetros en el cuerpo JSON:

| Parámetro | Tipo | Descripción |
| :--- | :--- | :--- |
| `x_login` | String | Identificador de usuario del comercio en QPayPro |
| `x_api_key` | String | Llave pública entregada por QPayPro |
| `x_api_secret` | String | Llave privada / secreto para firma de transacción |
| `x_amount` | String | Monto total de la orden en formato decimal |
| `x_currency_code` | String | Código de moneda (ej: `GTQ`) |
| `x_first_name` | String | Nombre del cliente |
| `x_last_name` | String | Apellido del cliente |
| `x_email` | String | Correo electrónico del cliente |
| `x_phone` | String | Teléfono de contacto |
| `x_address` | String | Dirección de entrega |
| `x_city` | String | Ciudad / Municipio |
| `x_state` | String | Departamento / Estado |
| `x_country` | String | País |
| `x_zip` | String | Código postal |
| `x_company` | String | Razón social o "C/F" (Consumidor Final) |
| `x_description` | String | Descripción de la compra (ej: `Orden #10`) |
| `x_invoice_num` | String | Número de factura / ID de orden |
| `x_relay_url` | String | URL Webhook de retorno del backend |

### Corrección en el Mapeo de Payload
En `QPayProService.java` debe asegurarse la inclusión explícita del parámetro `x_api_secret`:

```java
payload.put("x_login", apiLogin);
payload.put("x_api_key", apiKey);
payload.put("x_api_secret", apiSecret); // ← Requerido por la pasarela QPayPro
```

