# Diagnóstico y Corrección: Fuga del Código HTTP 401 al Iniciar Pago QPayPro

Este documento técnico explica por qué el intento de captura de `RestClientResponseException` relanzado como `RuntimeException` en `QPayProService.java` sigue enviando un status **HTTP 401 Unauthorized** al frontend y provocando el deslogueo de los usuarios.

---

## 🔍 Diagnóstico de la Causa Raíz

### 1. El Ajuste Realizado en `QPayProService.java`
En la última actualización, se agregó la siguiente captura de excepciones:

```java
try {
    ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl + "/register_transaction_store", request, Map.class);
    ...
} catch (org.springframework.web.client.RestClientResponseException e) {
    log.error("Error HTTP devuelto por QPayPro ({}): {}", e.getStatusCode(), e.getResponseBodyAsString());
    throw new RuntimeException("Fallo de comunicación con la pasarela de pagos. Contacte a soporte.");
}
```

### 2. ¿Por qué sigue devolviendo HTTP 401 al cliente?
El archivo `GestorDeErrores.java` (`@RestControllerAdvice`) intercepta las excepciones globales del backend. Sin embargo:

- **`GestorDeErrores.java` NO posee un `@ExceptionHandler(RuntimeException.class)`**.
- Maneja `IllegalArgumentException` (400), `BadCredentialsException` (401), `MethodArgumentNotValidException` (400), `InvalidDataAccessResourceUsageException` (500), entre otras.
- Al lanzarse un `RuntimeException` no capturado explícitamente por `@ExceptionHandler` en `GestorDeErrores`, el flujo de excepciones recae sobre el `BasicErrorController` por defecto de Spring Boot.
- Spring Boot inspecciona el `RestClientResponseException` original atado al stack trace, extrae su status original (**HTTP 401 de QPayPro**) y lo establece como el estado final de la respuesta HTTP enviada al cliente web.

### 3. Impacto en el Frontend
El cliente web tiene un interceptor central de sesión (`http-session.ts`). Al recibir un código **HTTP 401 Unauthorized** en cualquier respuesta de la API, deduce que la sesión JWT expiró o fue invalidada, ejecutando la limpieza de `localStorage` y redirigiendo al usuario al formulario de login.

---

## 🛠️ Soluciones Propuestas (Cualquiera de las 2 Opciones)

### Opción A (Recomendada - Ajuste en 1 línea en `QPayProService.java`)
Dado que `GestorDeErrores.java` ya maneja `IllegalArgumentException` devolviendo **HTTP 400 Bad Request**:

**En `QPayProService.java`:**
```java
} catch (org.springframework.web.client.RestClientResponseException e) {
    log.error("Error HTTP devuelto por QPayPro ({}): {}", e.getStatusCode(), e.getResponseBodyAsString());
    throw new IllegalArgumentException("Fallo de comunicación con la pasarela de pagos. Contacte a soporte.");
}
```

---

### Opción B (Agregar Manejador Global en `GestorDeErrores.java`)
Si se prefiere mantener la excepción `RuntimeException` o manejar explícitamente las excepciones de clientes REST:

**En `GestorDeErrores.java`:**
```java
@ExceptionHandler(org.springframework.web.client.RestClientResponseException.class)
public ResponseEntity<Map<String, String>> manejarErrorPasarelaExterna(
        org.springframework.web.client.RestClientResponseException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("error", "Fallo de comunicación con la pasarela de pagos"));
}

@ExceptionHandler(RuntimeException.class)
public ResponseEntity<Map<String, String>> manejarRuntimeException(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", ex.getMessage()));
}
```

---

## ✅ Resultado tras Aplicar el Ajuste
- El backend responderá un status **HTTP 400 Bad Request** o **HTTP 500 Internal Server Error** en JSON:
  `{ "error": "Fallo de comunicación con la pasarela de pagos. Contacte a soporte." }`
- **La sesión del cliente NUNCA se cerrará**.
- El frontend mostrará el mensaje en un toast y permitirá al usuario intentar nuevamente o seleccionar otro método de pago.

