# Plan de Refactorización y Pruebas: QPayPro

## Descripción del Objetivo
1. **Mejora de Seguridad y Configuración:** Eliminar los valores por defecto (fallbacks) quemados en las anotaciones `@Value` del servicio `QPayProService.java` para adherirse al principio de *Fail-Fast* (fallar rápido si falta configuración) y mantener las credenciales fuera del código fuente.
2. **Cobertura de Pruebas:** Implementar la suite de pruebas unitarias (`QPayProServiceTest`) utilizando Mockito para validar el comportamiento del servicio, permitiendo su ejecución nativa y depuración en IntelliJ IDEA.

## ⚠️ User Review Required
> [!TIP]
> **Buenas prácticas de configuración:** Al quitar los valores por defecto del código fuente, Spring exigirá que las propiedades existan al arrancar. Para los tests, inyectaremos valores falsos en `application-test.properties` (el perfil de pruebas). Para el desarrollo, deberás asegurarte de tenerlas en tu `application-dev.properties` local.

---

## Cambios Propuestos

### 1. Refactorización del Servicio
#### [MODIFY] `QPayProService.java`
Se eliminarán todos los fallbacks de las anotaciones `@Value`.
**Ejemplo de cambio:**
```java
// ANTES
@Value("${qpaypro.api.login:visanetgt_qpay}")
private String apiLogin;

// DESPUÉS
@Value("${qpaypro.api.login}")
private String apiLogin;
```

### 2. Configuración para Pruebas
#### [MODIFY] `src/test/resources/application-test.properties`
Para que el contexto de Spring no falle en las otras pruebas de integración (que cargan toda la aplicación), agregaremos propiedades de relleno (dummy):
```properties
qpaypro.api.login=test_login
qpaypro.api.key=test_key
qpaypro.api.secret=test_secret
qpaypro.api.url=http://localhost/mock
qpaypro.api.store-url=http://localhost/mock/store?token=
qpaypro.api.webhook-secret=TEST_SECRET
qpaypro.api.fel-url=http://localhost/mock/fel
```

### 3. Suite de Pruebas Unitarias (IntelliJ)
#### [NEW] `QPayProServiceTest.java`
Se creará en el paquete `com.jeplabs.ecommerce.domain.pago.qpaypro`. Utilizará `@ExtendWith(MockitoExtension.class)` para aislar el servicio y probar su lógica pura.
**Casos de prueba a implementar:**
1. `iniciarPago_DebeRetornarUrlConToken_CuandoQPayProRespondeExito()`: Simula la petición a QPayPro y verifica que se devuelva la URL concatenada correctamente y se guarde la transacción en la base de datos.
2. `iniciarPago_DebeEnviarCuotas_CuandoSePideMasDeUnaCuota()`: Verifica que el payload incluya `x_visacuotas=si`.
3. `iniciarPago_DebeLanzarExcepcion_CuandoQPayProFalla()`: Simula un error 400 o un `"estado": "error"`.
4. `confirmarPago_DebeAprobarOrdenYFacturar_CuandoEstadoEs1()`: Valida la ruta feliz del webhook de retorno.
5. `confirmarPago_DebeDenegarYCancelarOrden_CuandoEstadoNoEs1()`: Valida el rechazo de la tarjeta.

---

## Verification Plan

### Automated Tests
Se correrán los tests mediante Maven para asegurar que todo compila y pasa:
`.\mvnw.cmd clean test -Dtest=QPayProServiceTest -q`
Adicionalmente, ejecutaremos toda la suite para asegurar que quitar los fallbacks no rompe el arranque de Spring en otras pruebas:
`.\mvnw.cmd clean test -q`

### Manual Verification
El usuario podrá abrir la clase `QPayProServiceTest` en IntelliJ IDEA, presionar el botón verde de "Run" (Reproducir) al lado de la clase o de cada método, y depurar el código (Debug) paso a paso.
