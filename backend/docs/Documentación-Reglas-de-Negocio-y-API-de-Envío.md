# Documentación de Reglas de Negocio y API de Envíos

**Versión:** 1.0  
**Fecha de última actualización:** 16 de julio de 2026  
**Descripción:** Este documento detalla las reglas de negocio aplicables a los métodos de envío, pago y sus respectivas implementaciones en la API, incluyendo ejemplos de uso para pruebas en herramientas como Insomnia.

---

## 1. Reglas de Negocio

Las siguientes reglas definen el comportamiento del sistema en función del monto de la compra, el tipo de servicio de envío y el método de pago seleccionado:

1. **Envío Gratis (Condicional):**  
   Si el cliente compra un producto que supera el monto mínimo establecido, elige el servicio de envío **normal (no express)** y paga en línea (pasarela de pago o transferencia), el envío debe ser **gratis**.

2. **Envío Express Pagado:**  
   Si el cliente compra un producto que supera el monto mínimo, elige el servicio de envío **express** y paga en línea (pasarela o transferencia), el envío **se cobra**. No aplica la promoción de envío gratis.

3. **Pago Contraentrega (Envío Normal):**  
   Si el cliente compra un producto que no supera el mínimo (o lo supera), escoge el servicio **normal (no express)** y elige el método de pago **contraentrega**, el sistema **no cobra el envío**.  
   *Nota:* El cobro lo realiza directamente el servicio de entregas. En el detalle de la orden, el sistema debe mostrar el siguiente mensaje en lugar del precio o "gratis":  
   > *"El envío se paga de manera adicional al valor de la compra al recibir el producto"*.

4. **Restricción de Express con Contraentrega:**  
   Al seleccionar el servicio **express**, el sistema debe anotar explícitamente: *"No aplica para contraentrega"*. En este escenario, **solo deben aparecer disponibles** los métodos de pago en línea (pasarela y transferencia). La opción de contraentrega **no debe aparecer** bajo ninguna circunstancia.

---

## 2. Especificación de la API

### Endpoint: Obtener Opciones de Envío
Recupera las opciones de envío disponibles y sus costos en función del subtotal de la compra y la forma de pago del envío.

- **Método:** `GET`
- **Ruta:** `/api/envio/opciones`
- **Parámetros de Consulta (Query Parameters):**
  - `subtotal` (number, requerido): El monto total de los productos en el carrito.
  - `formaPagoEnvio` (string, requerido): `CONTRA_ENTREGA` o `EN_LINEA`.

---

## 3. Ejemplos de Uso en Insomnia

### 3.1. Consulta con Pago Contraentrega
Esta consulta excluye los servicios express, ya que no son compatibles con este método de pago.

**Solicitud:**
```http
GET /api/envio/opciones?subtotal=350.00&formaPagoEnvio=CONTRA_ENTREGA
```

**Respuesta Exitosa (200 OK):**
```json
{
  "envioGratis": false,
  "costoEnvio": null,
  "montoMinimoGratis": 500.00,
  "servicios": [
    {
      "nombre": "Cargo Express",
      "servicioExpress": false,
      "notaExpress": null,
      "costoEnLinea": 35.00,
      "costoContraEntrega": 45.00
    }
  ]
}
```
*(Nota: Servicios como "Guatex Express" no aparecen en esta respuesta).*

---

### 3.2. Consulta con Pago en Línea
Esta consulta incluye todos los servicios disponibles, incluidos los express, con sus respectivas advertencias.

**Solicitud:**
```http
GET /api/envio/opciones?subtotal=350.00&formaPagoEnvio=EN_LINEA
```

**Respuesta Exitosa (200 OK):**
```json
{
  "servicios": [
    {
      "nombre": "Cargo Express",
      "servicioExpress": false,
      "notaExpress": null
    },
    {
      "nombre": "Guatex Express",
      "servicioExpress": true,
      "notaExpress": "No aplica para contra entrega"
    }
  ]
}
```

---

## 4. Casos de Uso y Payloads de Orden

### 4.1. Orden con Pago Contraentrega
Cuando se procesa una orden válida con pago contraentrega y envío normal.

```json
{
  "costoEnvio": 0.00,
  "notaEnvio": "El envío se paga de manera adicional al valor de la compra al recibir el producto"
}
```

### 4.2. Orden con Servicio Express
Cuando se procesa una orden válida con servicio express (pago en línea).

```json
{
  "costoEnvio": 75.00,
  "notaEnvio": "Servicio express - entrega prioritaria"
}
```

---

## 5. Manejo de Errores y Validaciones

El sistema debe validar estrictamente la combinación de método de pago y tipo de envío. Si un cliente o un sistema intenta forzar una combinación no permitida, se debe devolver un error claro.

### 5.1. Error: Intentar usar Express con Contraentrega
Si la solicitud intenta combinar `formaPagoEnvio=CONTRA_ENTREGA` con un servicio marcado como `servicioExpress: true`.

**Respuesta de Error (400 Bad Request):**
```json
{
  "error": "El servicio express no está disponible para pago contra entrega"
}
```

---

## 6. Consideraciones para el Frontend / Consumidor de la API

1. **Ocultamiento de Opciones:** El frontend debe ocultar o deshabilitar la opción de "Contraentrega" en el formulario de pago si el usuario selecciona un servicio con `servicioExpress: true`.
2. **Visualización de Notas:** La propiedad `notaExpress` debe mostrarse visiblemente junto al nombre del servicio de envío cuando su valor no sea `null`.
3. **Mensaje de Contraentrega:** El texto exacto `"El envío se paga de manera adicional al valor de la compra al recibir el producto"` debe ser renderizado en el resumen de la orden en lugar de cualquier monto monetario de envío.