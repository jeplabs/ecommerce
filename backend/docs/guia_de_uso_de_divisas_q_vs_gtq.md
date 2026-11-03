# Guía de Uso de Moneda en E-commerce: Q vs. GTQ (Guatemala)

Al diseñar y desarrollar una plataforma de comercio electrónico para el mercado guatemalteco, la convención sobre cómo presentar los precios varía según la capa de la aplicación (experiencia visual de usuario vs. infraestructura técnica/transaccional).

---

## 1. Uso de **Q** (Símbolo de Moneda Local)

**Q** es el símbolo nacional oficial del Quetzal guatemalteco. Su uso primordial pertenece a la capa visual (**Front-end / UI**) dirigida al consumidor final.

### Casos de aplicación recomendados:
* **Fichas de producto y catálogos:** Proporciona una lectura ágil, familiar y natural para el comprador guatemalteco (ej. `Q 150.00` o `Q150.00`).
* **Carrito y proceso de Checkout:** Mantiene la interfaz limpia y consistente con los hábitos de compra locales.
* **Banners publicitarios y promociones:** Ocupa menos espacio horizontal y tiene reconocimiento visual instantáneo.
* **Comercios mono-moneda / 100% locales:** Si la tienda vende exclusivamente en Guatemala y no maneja otras divisas, **Q** es la opción estándar preferida.

---

## 2. Uso de **GTQ** (Código de Divisa ISO 4217)

**GTQ** es el estándar de tres letras asignado por la Organización Internacional de Normalización (ISO) para el Quetzal. Su uso es mandatorio en entornos técnicos, transaccionales, fiscales y multi-divisa.

### Casos de aplicación recomendados:
* **Integraciones con Pasarelas de Pago:** Las APIs bancarias y de cobro (Cybersource, Stripe, QPayPro, BAC Credomatic, VisaNet/NeoNet, etc.) exigen el código ISO de 3 caracteres:
  ```json
  {
    "amount": 150.00,
    "currency": "GTQ"
  }
  ```
* **Tiendas Multimoneda:** Si la tienda opera en varios países o permite alternar entre Quetzales y Dólares (`GTQ` / `USD`), el código ISO evita cualquier ambigüedad en selectores de divisa.
* **Datos Estructurados y SEO (Schema.org):** En el marcado de productos para motores de búsqueda (Google Shopping, snippets enriquecidos), el estándar exige el código ISO:
  ```json
  "offers": {
    "@type": "Offer",
    "price": "150.00",
    "priceCurrency": "GTQ"
  }
  ```
* **Facturación Electrónica (FEL) y Reportes Contables:** La Superintendencia de Administración Tributaria (SAT) y los sistemas ERP requieren la identificación estandarizada de divisa en documentos contables.

---

## 3. Matriz Resumen de Implementación

| Componente / Escenario | Formato Recomendado | Ejemplo |
| :--- | :---: | :--- |
| Precios en Catálogo / PDP | **Q** | `Q 350.00` |
| Resumen de Carrito (UI) | **Q** | Total: `Q 350.00` |
| Selector de Divisas (Dropdown) | **GTQ** o **Ambos** | `GTQ (Q)` / `USD ($)` |
| Solicitud a Pasarela de Pago | **GTQ** | `"currency": "GTQ"` |
| Base de Datos (campo `currency`) | **GTQ** | `VARCHAR(3) = 'GTQ'` |
| Metadatos Schema.org / SEO | **GTQ** | `"priceCurrency": "GTQ"` |
| Factura Electrónica (FEL XML) | **GTQ** | `<Moneda>GTQ</Moneda>` |

---

## 4. Buenas Prácticas de Formato

1. **Espaciado:** Se recomienda dejar un espacio fino o estándar entre el símbolo y la cifra (`Q 150.00`) para mejorar la legibilidad.
2. **Separador de miles y decimales:** En Guatemala, la convención estándar adoptada en banca y comercio es la coma para miles y el punto para decimales: `Q 1,250.00`.
3. **Consistencia interna:** Mantén una única regla de formato en todo el sitio (no mezclar `Q150.00` con `GTQ 150.00` en la misma pantalla).