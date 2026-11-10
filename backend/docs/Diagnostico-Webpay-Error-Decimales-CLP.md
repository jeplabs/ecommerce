# Diagnóstico Técnico: Error Transbank `"Commerce is CHILEAN_PESO so decimal amounts are not allowed"` con Perfil Chile (`CLP`)

> **Documento de Diagnóstico — Backend (Webpay / Órdenes / Multi-país) & Frontend (`formatCurrency`)**  
> **Fecha:** Noviembre 2026  
> **Estado:** Diagnóstico documentado (sin cambios de código aplicados)

---

## 1. Síntoma Reportado

Al arrancar el backend con perfil de Chile (`dev,cl`), la UI muestra todos los precios formateados en pesos chilenos (`CLP`, símbolo `$`) y **sin decimales visibles**. Sin embargo, al intentar pagar con **Webpay Plus**, la operación falla en `POST /api/pagos/webpay/iniciar` con:

```text
Error al iniciar transacción con Webpay: cl.transbank.webpay.exception.TransbankHttpApiException:
Commerce is CHILEAN_PESO so decimal amounts are not allowed | code : 400
```

---

## 2. Análisis: ¿Por qué ocurre si en pantalla se ve sin decimales?

El problema nace de la combinación de **tres factores reales verificados en el código**:

### Factor 1 — El frontend oculta y redondea visualmente los decimales (`api.moneda.decimales=0`)
En [`application-cl.properties`](../src/main/resources/application-cl.properties#L13-L17), el perfil de Chile configura:
```properties
api.moneda.codigo=CLP
api.moneda.simbolo=$
api.moneda.locale=es-CL
api.moneda.decimales=0
```
Cuando el frontend recibe `decimales: 0` desde `GET /api/config`, la función [`formatCurrency`](../../frontend/src/utils/format.ts#L25-L33) formatea cualquier número con:
```ts
new Intl.NumberFormat(activeCurrency.locale, {
    minimumFractionDigits: activeCurrency.decimales, // 0
    maximumFractionDigits: activeCurrency.decimales, // 0
}).format(num)
```
**Efecto en pantalla:** Si el precio o el total real de la orden es **`1627.50`** o **`7742.25`**, `Intl.NumberFormat` **lo redondea solo para mostrarlo** (`$ 1.628` o `$ 7.742`). Visualmente parece un entero exacto, pero el valor almacenado en la base de datos y calculado por el backend **sí tiene decimales**.

---

### Factor 2 — El perfil `dev,cl` cambia reglas/moneda en memoria, pero no transforma los precios ya sembrados en PostgreSQL
En [`V1__init_schema.sql`](../src/main/resources/db/migration/V1__init_schema.sql), las columnas monetarias (`precio_venta`, `tarifa`, `subtotal`, `iva`, `total`) son `NUMERIC(10, 2)`.

Si la base de datos local se inicializó con las semillas por defecto (`V2` + `V7`) o contiene cualquier producto/tarifa con centavos:
- [`V7__seed_producto_precios_dev.sql`](../src/main/resources/db/seed/V7__seed_producto_precios_dev.sql#L5-L40) inserta precios en `GTQ` con decimales como `7742.25`, `5029.75`, `1627.50`, `271.25`.
- Cambiar `spring.profiles.active=dev,cl` en `application.properties` **no convierte ni reemplaza esos precios en PostgreSQL**; para tener el catálogo en pesos chilenos enteros (`.00`), es necesario aplicar [`backend/docs/sql/productosPreciosCLP.sql`](./sql/productosPreciosCLP.sql) y el script SQL de servicios de envío/sucursales documentado en [`Guia-Multipais-Guatemala-Chile-y-Moneda-Frontend.md`](./Guia-Multipais-Guatemala-Chile-y-Moneda-Frontend.md#L189-L269).
- Adicionalmente, incluso si se creara manualmente un producto o tarifa con decimales desde Admin mientras está activo el perfil `CL`, `OrdenService.crear` guardará esos decimales en `orden.total` porque no existe ninguna validación ni redondeo por moneda al guardar la orden.

---

### Factor 3 — `WebpayService.iniciar` pasa `doubleValue()` directo al SDK de Transbank (y `transbank-sdk-java` serializa `double` con `.0` vía Gson)
En [`WebpayService.java`](../src/main/java/com/jeplabs/ecommerce/domain/pago/webpay/WebpayService.java#L78-L82):
```java
// Monto SIEMPRE desde la BD, nunca del request
double monto = orden.getTotal().doubleValue();

WebpayPlusTransactionCreateResponse response =
        webpayConfig.crearTransaction()
                .create(buyOrder, sessionId, monto, returnUrl);
```
Al inspeccionar directamente el SDK `transbank-sdk-java:6.2.1` (`pom.xml:146`):
1. `WebpayPlus.Transaction.create(String, String, double, String)` recibe un `double` primitivo y construye `TransactionCreateRequest` (`private double amount`).
2. `cl.transbank.util.JsonUtilImpl` serializa ese objeto usando `GsonBuilder().setFieldNamingPolicy(LOWER_CASE_WITH_UNDERSCORES).create()`.
3. **Verificado ejecutando el propio `JsonUtilImpl` del `.jar` de `transbank-sdk-java:6.2.1`:**
   - Si `orden.getTotal()` tiene decimales reales (p. ej. `7742.25`), envía `"amount":7742.25` ➔ Transbank rechaza inmediatamente con HTTP `400`: `Commerce is CHILEAN_PESO so decimal amounts are not allowed`.
   - **Incluso si `orden.getTotal()` fuera un entero exacto como `1862000.00`**, `Gson` por defecto serializa `double` con `.0` (`"amount":1862000.0`). Si el entorno/validador REST de Transbank evalúa estrictamente el formato JSON sin punto decimal para `CHILEAN_PESO` (además de validar parte fraccionaria `!= 0`), este tipo `double` también expone el riesgo de formato decimal.

---

### Factor 4 (Riesgo Crítico Asociado) — Validación de Monto en Confirmación (Caso 7)
En [`WebpayService.java`](../src/main/java/com/jeplabs/ecommerce/domain/pago/webpay/WebpayService.java#L254-L258):
```java
if (BigDecimal.valueOf(response.getAmount()).compareTo(transaccion.getMonto()) != 0) {
    transaccion.rechazar(MotivoRechazoWebpay.REJECTED, response.getResponseCode());
    return DatosRespuestaConfirmarWebpay.fallido(
            "El monto cobrado no coincide con el total de la orden", MotivoRechazoWebpay.REJECTED);
}
```
> [!CAUTION]
> **No basta con redondear únicamente dentro de `WebpayService.iniciar()`.**  
> Si `orden.total` en base de datos vale `7742.25` y solo se redondea a `7742` al llamar a Transbank, entonces `WebpayTransaccion.monto` quedaría guardado como `7742.25`. Cuando el cliente pague `7742` en Webpay y vuelva al `/confirmar`, la comparación `7742.0 != 7742.25` **rechazaría un pago ya cobrado en el banco**.

---

## 3. Cómo Resolverlo (Plan Recomendado)

Para eliminar definitivamente el problema en todos los niveles (datos, dominio y pasarela):

### Paso 1 — Verificar / migrar los datos de BD al cambiar a perfil Chile (`CL`)
Si la BD local venía sembrada con datos de Guatemala:
1. Ejecutar `TRUNCATE TABLE precio_historial RESTART IDENTITY;` y aplicar [`backend/docs/sql/productosPreciosCLP.sql`](./sql/productosPreciosCLP.sql) (todos los precios CLP son enteros `.00`).
2. Aplicar el script de `servicios_envio`, `metodos_pago`, `sucursales` y `cuentas_bancarias` de la sección 4.3 de [`Guia-Multipais-Guatemala-Chile-y-Moneda-Frontend.md`](./Guia-Multipais-Guatemala-Chile-y-Moneda-Frontend.md#L208-L269).
3. Cancelar o limpiar órdenes `PENDIENTE` viejas creadas con precios con decimales antes del cambio de precios.

### Paso 2 — Alinear la escala monetaria desde el origen (`MonedaConfig` + `OrdenService`)
1. En [`OrdenService.crear`](../src/main/java/com/jeplabs/ecommerce/domain/orden/OrdenService.java) (y al guardar precios/tarifas en Admin cuando `api.moneda.decimales == 0`), normalizar/redondear los montos de la orden usando `monedaConfig.getDecimales()` con `RoundingMode.HALF_UP` (para `CLP`: `scale = 0`, de modo que `orden.subtotal`, `orden.costoEnvio` y `orden.total` coincidan exactamente con lo que el cliente vio formateado por `formatCurrency` en el frontend).
2. De esa forma, `orden.total`, `WebpayTransaccion.monto` y el monto enviado a Transbank serán **el mismo valor entero exacto**, manteniendo íntegra la validación del **Caso 7** en `WebpayService.procesarAprobada`.

### Paso 3 — Blindaje en `WebpayService.iniciar` (y manejo de serialización del SDK)
1. **Validación defensiva en `WebpayService.iniciar`:**
   - Verificar que `monedaConfig.getCodigo()` sea `"CLP"` (evitando cobros en Webpay bajo perfil `GT`).
   - Verificar explícitamente que `orden.getTotal()` no tenga parte fraccionaria distinta de cero (`orden.getTotal().stripTrailingZeros().scale() > 0`) — o si se redondea, hacerlo al persistir la orden, nunca desfasado respecto a `WebpayTransaccion.monto`.
2. **Sobre la serialización `.0` de Gson en `transbank-sdk-java`:**
   - En pruebas de integración con `transbank-sdk-java:6.2.1`, si tras verificar que `orden.getTotal()` es entero exacto (`scale <= 0`, ej. `1862000.00`) Transbank aún rechazara `"amount":1862000.0` emitido por `JsonUtilImpl`, se puede configurar un `HttpUtilImpl` / `JsonUtil` en `WebpayConfig` cuyo `GsonBuilder` registre un `TypeAdapter<Double>` que serialice valores enteros sin `.0` (por ej. `1862000` cuando `d == Math.rint(d)`), manteniendo el contrato nativo del SDK `6.2.1`.

### Paso 4 — Prevención visual en Admin y Carrito
- En el formulario de productos/envíos del Admin en frontend, usar `step="1"` cuando `decimales === 0` (`CLP`) y `step="0.01"` cuando `decimales === 2` (`GTQ`), evitando ingresar centavos accidentalmente en Chile.
