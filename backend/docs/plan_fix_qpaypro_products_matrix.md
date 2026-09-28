# Plan: Corrección de Monto 0 en Pasarela QPayPro

## 1. Diagnóstico y Causa Raíz

### 🔍 El Problema
Al redirigir a la pasarela alojada de QPayPro (`https://sandboxpayments.qpaypro.com/checkout/store?token=...`):
- Si el envío es gratis (Q0.00), la pasarela muestra un total de **Q0.00**.
- Si el envío tiene costo (ej. Q35.00), la pasarela únicamente muestra el valor del envío (**Q35.00**) y no suma los productos.

---

### 🚨 La Causa Raíz Exacta: Matriz `products` con Columnas Invertidas

En la documentación técnica previa del proyecto (`informe-tecnico-qpaypro.md` y `qpaypro-integration-fix.md`) se asumió erróneamente que la matriz posicional de productos era:
```
// ❌ Estructura errónea en el código actual:
[["Nombre", "Precio", "SKU", "Cantidad", "TaxFlag", "TotalFlag"]]
   idx 0     idx 1    idx 2    idx 3      idx 4       idx 5
```

Sin embargo, la **especificación oficial de la API de QPayPro** (`register_transaction_store`) exige el siguiente orden posicional estricto:
```
// ✅ Estructura oficial requerida por QPayPro:
[description, SKU, url_product, quantity, Price, total_product]
   idx 0      idx 1     idx 2       idx 3    idx 4       idx 5
```

### 💥 ¿Qué estaba leyendo QPayPro?

Al comparar ambas posiciones:

| Índice | Lo que QPayPro espera | Lo que nuestro código enviaba | Resultado en QPayPro |
| :---: | :--- | :--- | :--- |
| **0** | `description` (Nombre) | `nombre` ("Producto") | Nombre correcto |
| **1** | `SKU` | `precio` ("250.00") | QPayPro guarda el precio como SKU |
| **2** | `url_product` | `sku` ("PROD-01") | QPayPro guarda el SKU como URL |
| **3** | `quantity` | `cantidad` ("1") | Cantidad 1 |
| **4** | **`Price` (Precio unitario)** | **`"0"` (Tax Flag ficticio)** | **¡QPayPro lee que el precio del producto es Q0.00!** |
| **5** | **`total_product` (Total línea)** | **`"1"` (Total Flag ficticio)** | QPayPro descarta o toma 0 porque el precio es 0 |

### 🧩 Por qué todo encaja con los síntomas:
1. **Cuando el envío tiene costo (ej. Express Q35.00)**:
   - Valor productos leído por QPayPro = `Q0.00` (índice 4 era `"0"`).
   - Valor envío (`x_freight`) = `Q35.00`.
   - Total mostrado en la pasarela = `0.00 + 35.00 = Q35.00`.
2. **Cuando el envío es gratis (compra > Q500, envío Q0.00)**:
   - Valor productos leído por QPayPro = `Q0.00`.
   - Valor envío (`x_freight`) = `Q0.00`.
   - Total mostrado en la pasarela = `0.00 + 0.00 = Q0.00`.

---

## 2. Cambios Propuestos

### Componente: Backend (`ecommerce/backend`)

#### [MODIFY] `QPayProService.java`
Reestructurar la matriz `products` conforme a la especificación oficial de QPayPro y asegurar el formateo a 2 decimales (`Locale.US`):

```java
// Estructura oficial QPayPro: [description, SKU, url_product, quantity, Price, total_product]
List<List<String>> productsList = new ArrayList<>();
if (orden.getItems() != null && !orden.getItems().isEmpty()) {
    for (OrdenItem item : orden.getItems()) {
        String nombre = item.getNombreProducto() != null ? item.getNombreProducto() : "Producto";
        String sku = item.getSku() != null ? item.getSku() : "";
        int cant = item.getCantidad() != null ? item.getCantidad() : 1;
        BigDecimal precioUnitario = item.getPrecioUnitario() != null ? item.getPrecioUnitario() : BigDecimal.ZERO;
        BigDecimal totalItem = precioUnitario.multiply(BigDecimal.valueOf(cant));

        String precioStr = String.format(Locale.US, "%.2f", precioUnitario);
        String cantidadStr = String.valueOf(cant);
        String totalItemStr = String.format(Locale.US, "%.2f", totalItem);

        List<String> prod = new ArrayList<>();
        prod.add(nombre);        // 0: description
        prod.add(sku);           // 1: SKU
        prod.add("");            // 2: url_product
        prod.add(cantidadStr);   // 3: quantity
        prod.add(precioStr);     // 4: Price (precio unitario real)
        prod.add(totalItemStr);  // 5: total_product (cantidad * precio)
        productsList.add(prod);
    }
} else {
    // Fallback si items no estuvieran cargados
    BigDecimal subtotal = orden.getSubtotal() != null ? orden.getSubtotal() : orden.getTotal();
    String subtotalStr = String.format(Locale.US, "%.2f", subtotal != null ? subtotal : BigDecimal.ZERO);

    List<String> prod = new ArrayList<>();
    prod.add("Orden #" + orden.getId()); // 0: description
    prod.add("");                       // 1: SKU
    prod.add("");                       // 2: url_product
    prod.add("1");                      // 3: quantity
    prod.add(subtotalStr);              // 4: Price
    prod.add(subtotalStr);              // 5: total_product
    productsList.add(prod);
}
```

Asegurar también el formateo de `x_amount` y `x_freight`:
```java
String amountStr = String.format(Locale.US, "%.2f", orden.getTotal());
String freightStr = String.format(Locale.US, "%.2f", orden.getCostoEnvio() != null ? orden.getCostoEnvio() : BigDecimal.ZERO);

payload.put("x_amount", amountStr);
payload.put("x_freight", freightStr);
payload.put("x_tax", "0.00");
payload.put("taxes", "0.00");
```

#### [MODIFY] `OrdenRepository.java` y `QPayProController.java`
Para garantizar que `orden.getItems()` siempre esté disponible y no dependa de transacciones perezosas (lazy-loading):
- Agregar consulta `findByIdConItems` con `LEFT JOIN FETCH o.items` en `OrdenRepository.java`.
- En `QPayProController.java`, recuperar la orden usando `ordenRepository.findByIdConItems(ordenId)`.

---

## 3. Plan de Verificación

### Pruebas Automatizadas
Ejecutar la suite completa para asegurar que no haya regresiones en los tests unitarios y de integración:
```bash
.\mvnw.cmd clean test -q
```

### Verificación Manual en Sandbox
1. **Caso 1: Compra con Envío Gratis (> Q500)**
   - Agregar productos al carrito por más de Q500.
   - Seleccionar envío normal (Q0.00).
   - Iniciar pago con QPayPro.
   - En la página de QPayPro Sandbox, verificar que el total a pagar sea el valor real de los productos (ej. Q600.00) y no Q0.00.
2. **Caso 2: Compra con Envío (< Q500 o Express)**
   - Agregar productos por menos de Q500 o seleccionar envío Express.
   - Iniciar pago con QPayPro.
   - En la página de QPayPro Sandbox, verificar que el total sea la suma exacta de los productos + el flete.
