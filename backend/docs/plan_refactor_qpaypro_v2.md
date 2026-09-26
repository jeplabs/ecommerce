# Diagnóstico y Plan de Refactorización: QPayProService

## Descripción del Objetivo
Auditoría de calidad del código actual de la integración QPayPro, identificando malas prácticas, inconsistencias entre los documentos técnicos y la implementación real, y proponiendo una refactorización profunda siguiendo principios SOLID y buenas prácticas de Spring Boot.

---

## 🔴 Hallazgos Críticos (Malas Prácticas)

### 1. Línea 37 — `ObjectMapper` como `static final` con FQN inline
```java
private static final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
```

**Problemas:**
- **Nombre de clase completamente cualificado (FQN) inline**: Usar `com.fasterxml.jackson.databind.ObjectMapper` en lugar de un `import` es una mala práctica de legibilidad. Debería existir un `import` en la cabecera del archivo.
- **`static final` como parche reactivo**: Se implementó así porque inyectarlo vía constructor (`@RequiredArgsConstructor`) causó un `NoSuchBeanDefinitionException` en los tests `@WebMvcTest`. La solución correcta no es esquivar Spring, sino configurar correctamente el Bean.
- **Contexto correcto**: En Spring Boot, `ObjectMapper` **sí es un Bean auto-configurado** por `JacksonAutoConfiguration`. El problema que causó el fallo del contexto fue que los tests `@WebMvcTest` usan un contexto parcial que no siempre incluye la auto-configuración de Jackson. La solución correcta es agregar `@Import(JacksonAutoConfiguration.class)` al test, o simplemente usar `@MockBean` para el servicio en los tests de controller.

**Veredicto**: Eliminar el `static final`. Inyectar el `ObjectMapper` normalmente vía constructor de Lombok.

---

### 2. Líneas 110, 112, 114, 118, 128 — FQN inline en lugar de `import`
```java
List<List<String>> productsList = new java.util.ArrayList<>();
for (com.jeplabs.ecommerce.domain.orden.OrdenItem item : orden.getItems()) {
    String precio = String.format(java.util.Locale.US, "%.2f", ... java.math.BigDecimal.ZERO);
```

**Problema**: Se usaron nombres completamente cualificados (`java.util.ArrayList`, `com.jeplabs.ecommerce.domain.orden.OrdenItem`, `java.util.Locale.US`, `java.math.BigDecimal.ZERO`) directamente en el cuerpo del método, en lugar de declararlos en la sección de `import`.

**Causa raíz**: Esto sucedió porque yo (la IA) usé `replace_file_content` para inyectar código sin tocar la sección de imports, y usé FQN como atajo para evitar errores de compilación. **Es una mala práctica de mi parte.**

**Veredicto**: Mover todos los FQN a la sección de `import` del archivo.

---

### 3. Línea 77 — `x_last_name` devuelve `""` (cadena vacía)
```java
payload.put("x_last_name", orden.getUsuario().getApellido() != null ? orden.getUsuario().getApellido() : "");
```

**Problema**: El documento `qpaypro-integration-fix.md` diagnosticó claramente que CyberSource rechaza cadenas vacías en `x_last_name` (Error #102). Sin embargo, **la implementación actual sigue enviando `""` como fallback**, ignorando la sanitización propuesta en ambos documentos que usa `firstName` como fallback.

**Veredicto**: Aplicar la sanitización completa documentada.

---

### 4. Líneas 76-84 — Ausencia total de sanitización para CyberSource
El código actual accede directamente a los campos de la orden sin sanitización:
```java
payload.put("x_first_name", orden.getUsuario().getNombre());  // Puede ser null → NPE
payload.put("x_phone", orden.getDireccionTelefono());          // Puede tener guiones → Error #102
payload.put("x_address", orden.getDireccionCalle());           // Puede ser null
```

**Problema**: Ambos documentos (`qpaypro-integration-fix.md` §A y `informe-tecnico-qpaypro.md` §A) detallan sanitización estricta con fallbacks. **Nada de esa sanitización fue implementada en el código actual.**

**Veredicto**: Implementar el bloque completo de sanitización antes de armar el payload.

---

### 5. Línea 92 — `taxes` envía IVA real, contradice los documentos
```java
payload.put("taxes", orden.getIva() != null ? orden.getIva().toString() : "0.00");
```

**Problema**: Los documentos establecieron que `taxes` debe ser `"0.00"` porque los precios ya incluyen IVA. Pero el código actual envía `orden.getIva()` si existe, lo cual **recrea exactamente el Error #502** que los documentos diagnosticaron.

**Veredicto**: Forzar `"0.00"`.

---

### 6. Línea 83 — `x_country` hardcoded a `"GT"`
```java
payload.put("x_country", "GT"); // Forzado a GT para CyberSource
```

**Problema menor**: Funciona para Guatemala, pero si algún día se expande a otros países, esto será un bug. Lo correcto es aplicar la sanitización dinámica documentada: si el país tiene 2 letras ISO, usarlo; si no, defaultear a `"GT"`.

---

### 7. Línea 184 — `catch (Exception ignored) {}` silencioso
```java
try {
    Long ordenId = Long.parseLong(invoiceNum);
    transaccion = qpayproRepository.findByOrdenIdAndEstado(ordenId, EstadoQPayPro.PENDIENTE).orElse(null);
} catch (Exception ignored) {}
```

**Problema**: `catch (Exception ignored)` es un anti-patrón. Si ocurre un error de base de datos (conexión caída, timeout), se tragará silenciosamente y el sistema activará el fallback creyendo que es un problema del Sandbox, cuando en realidad la BD falló.

**Veredicto**: Capturar solo `NumberFormatException` (que es lo que realmente puede lanzar `Long.parseLong`) y loggear cualquier otro error.

---

### 8. Línea 48-49 — Error silencioso en Controller (`catch (Exception e)` vacío)
```java
} catch (Exception e) {
    // Manejar error silenciosamente si el fallback falla, al menos redirigir a error
}
```

**Problema**: Si `confirmarPago` falla (BD caída, excepción inesperada), el controller **no loggea nada** y redirige al frontend con `status=failure` sin dejar rastro. Es imposible debuggear en producción.

**Veredicto**: Loggear el error.

---

### 9. Línea 37 — Imports FQN en `QPayProController`
```java
public org.springframework.web.servlet.view.RedirectView retornoQPayPro(...)
return new org.springframework.web.servlet.view.RedirectView(targetUrl);
```

**Veredicto**: Mover a `import`.

---

### 10. Línea 10 — Imports FQN en `QPayProTransaccionRepository`
```java
Optional<QPayProTransaccion> findFirstByEstadoAndMontoOrderByCreadoAtDesc(EstadoQPayPro estado, java.math.BigDecimal monto);
```

**Veredicto**: Mover a `import`.

---

## 🟡 Inconsistencias entre Documentos e Implementación

| Aspecto | Documentos dicen | Código actual hace |
|---|---|---|
| `x_last_name` vacío | Fallback a `firstName` | Fallback a `""` (rompe CyberSource) |
| `taxes` | `"0.00"` siempre | `orden.getIva().toString()` (causa 502) |
| `x_phone` | Limpiar a dígitos, mínimo 8 | Pasa raw sin sanitizar |
| `x_first_name` | Fallback a `"Cliente"` | Sin null-check, puede lanzar NPE |
| Fallback confirmarPago | Usa `findFirstByEstadoOrderByCreadoAtDesc` | Usa `findFirstByEstadoAndMontoOrderByCreadoAtDesc` (mejor, pero inconsistente con docs) |
| Controller redirect | `HttpServletResponse.sendRedirect` | `RedirectView` (mejor, pero inconsistente con docs) |

---

## Cambios Propuestos

### [MODIFY] `QPayProService.java`
1. Eliminar `static final ObjectMapper`, inyectarlo vía constructor.
2. Mover todos los FQN a la sección de `import`.
3. Implementar bloque completo de sanitización CyberSource antes del payload.
4. Forzar `taxes` a `"0.00"`.
5. Reemplazar `catch (Exception ignored)` por `catch (NumberFormatException e)`.
6. Usar `List.of()` inmutable donde sea posible para la matriz de productos.

```java
// Sanitización CyberSource (ANTES de armar el payload)
String firstName = orden.getUsuario() != null && orden.getUsuario().getNombre() != null
        && !orden.getUsuario().getNombre().isBlank()
        ? orden.getUsuario().getNombre() : "Cliente";

String lastName = orden.getUsuario() != null && orden.getUsuario().getApellido() != null
        && !orden.getUsuario().getApellido().isBlank()
        ? orden.getUsuario().getApellido() : firstName;

String email = orden.getUsuario() != null && orden.getUsuario().getEmail() != null
        && !orden.getUsuario().getEmail().isBlank()
        ? orden.getUsuario().getEmail() : "cliente@ejemplo.com";

String phoneRaw = orden.getDireccionTelefono() != null
        ? orden.getDireccionTelefono().replaceAll("[^0-9]", "") : "";
String phone = phoneRaw.length() >= 8 ? phoneRaw : "12345678";

String address = orden.getDireccionCalle() != null && !orden.getDireccionCalle().isBlank()
        ? orden.getDireccionCalle() : "Ciudad de Guatemala";

String city = orden.getDireccionCiudad() != null && !orden.getDireccionCiudad().isBlank()
        ? orden.getDireccionCiudad() : "Guatemala";

String state = orden.getDireccionEstado() != null && !orden.getDireccionEstado().isBlank()
        ? orden.getDireccionEstado() : "Guatemala";

String countryRaw = orden.getDireccionPais();
String country = countryRaw != null && countryRaw.trim().length() == 2
        ? countryRaw.trim().toUpperCase() : "GT";

String zip = orden.getDireccionCodigoPostal() != null && !orden.getDireccionCodigoPostal().isBlank()
        ? orden.getDireccionCodigoPostal() : "01001";
```

---

### [MODIFY] `QPayProController.java`
1. Mover FQN de `RedirectView` a `import`.
2. Agregar `log.error(...)` en el bloque catch.

---

### [MODIFY] `QPayProTransaccionRepository.java`
1. Mover `java.math.BigDecimal` a `import`.

---

### [MODIFY] `QPayProServiceTest.java`
1. Añadir stub de `frontendUrlBase` en `setUp()` (actualmente no se setea vía ReflectionTestUtils, pero el servicio lo usa en `iniciarPago`).

---

## Plan de Verificación

### Automated Tests
```bash
.\mvnw.cmd clean test -q
```

### Manual Verification
1. Confirmar que los 52 tests pasan (Exit code 0).
2. Verificar que `QPayProService.java` no contenga ningún FQN inline.
3. Verificar que todos los campos del payload tengan sanitización null-safe.
