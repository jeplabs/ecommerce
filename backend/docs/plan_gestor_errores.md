# Plan de Implementación: Prevención de Fugas de Estado HTTP 401

## Descripción del Problema
Cuando la pasarela de pagos QPayPro rechaza una transacción en el backend (por credenciales incorrectas, sandbox, etc.) y devuelve un `401 Unauthorized`, Spring Boot enruta esta excepción no manejada (`RestClientResponseException`) hacia su `BasicErrorController`. El framework extrae el estatus original (401) y lo propaga hacia la respuesta del frontend. El frontend, al detectar un `401`, asume que el token JWT del usuario expiró e invalida la sesión de compra, expulsando al usuario del sistema.

## Cambios Propuestos y Ejecutados

### [MODIFICADO] `GestorDeErrores.java`
Se implementó la **Opción B** del análisis documental mediante la adición de dos nuevos manejadores en el `@RestControllerAdvice` global de la aplicación:

1. **Trampa para Excepciones HTTP (`RestClientResponseException`)**:
   - Todo error externo se captura y se fuerza a retornar un estado **`502 Bad Gateway`**.
   - **Razón:** Protege la integridad de la sesión del usuario. El error indica que el fallo ocurrió con el proveedor upstream (QPayPro) y no con las credenciales locales del usuario.

2. **Red de Seguridad Final (`Exception.class`)**:
   - Todo error no capturado explícitamente (`NullPointerException`, `IllegalStateException`, `RuntimeException` de lógica de pagos) se captura aquí y devuelve un estado **`500 Internal Server Error`**.
   - **Razón:** Previene la fuga de HTML generados por el framework y asegura que la aplicación siempre responda con el formato JSON esperado por el frontend.

## Plan de Verificación

### Verificación Manual Sugerida
1. Mantener las credenciales inválidas/dummy en `application-dev.properties` para `qpaypro.api.login` y `apiKey`.
2. Como cliente logueado en el frontend, añadir un producto al carrito y proceder al checkout.
3. Presionar el botón de "Pagar con QPayPro".
4. **Validación Exitosa:** 
   - El backend debe imprimir el error de red en consola (rojo).
   - El frontend NO debe redirigir a `/login`.
   - Se debe mostrar un mensaje (toast) indicando fallo de comunicación.
   - En la pestaña "Network" (Red) de las DevTools, el request a `/iniciar` debe mostrar estado `502` en lugar de `401`.
