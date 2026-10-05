# Guía de Integración Frontend: Sincronización, Expiración y Restauración del Carrito

Esta guía detalla los endpoints, contratos JSON, comportamientos recomendados de UX y lógica de temporizadores para que el equipo de frontend integre la sincronización y expiración del carrito.

---

## 1. Contrato de Respuesta de la API (`/api/carrito`)

Todos los endpoints que retornan el carrito (`GET /api/carrito`, `POST /items`, `PATCH /items/{id}`, `DELETE /items/{id}`, `DELETE /api/carrito`, `POST /renovar`) incluyen ahora el objeto **`expiracion`**:

```json
{
  "id": 15,
  "estado": "ACTIVO",
  "expiraAt": "2026-10-05T16:45:00",
  "items": [
    {
      "id": 42,
      "productoId": 10,
      "nombre": "Zapatos Deportivos",
      "cantidad": 2,
      "precioUnitario": 150.00,
      "subtotal": 300.00
    }
  ],
  "total": 300.00,
  "totalItems": 2,
  "expiracion": {
    "expiraAt": "2026-10-05T16:45:00",
    "segundosRestantes": 1800,
    "ttlTotalSegundos": 3600,
    "avisoSegundosAntes": 600,
    "carritoAnteriorExpirado": false
  }
}
```

### Campos del objeto `expiracion`:
| Campo | Tipo | Descripción |
|---|---|---|
| `segundosRestantes` | `number` | **Fuente de verdad para el temporizador**. Segundos calculados en el servidor hasta que el carrito expire. Inmune a diferencias de zona horaria o reloj del cliente. |
| `ttlTotalSegundos` | `number` | TTL total configurado en el servidor (ej. 3600 para 60 min). Sirve para calcular el porcentaje de la barra de progreso: `(segundosRestantes / ttlTotalSegundos) * 100`. |
| `avisoSegundosAntes` | `number` | Umbral recomendado para mostrar la pre-alerta de renovación (ej. 600 = últimos 10 minutos). |
| `carritoAnteriorExpirado` | `boolean` | `true` si el carrito previo venció por inactividad y el servidor generó uno nuevo. Señal ideal para mostrar el aviso amigable con botón de restauración. |
| `expiraAt` | `string` | Fecha ISO de referencia (se mantiene por retrocompatibilidad). |

---

## 2. Nuevos Endpoints Disponibles

### A. Extender tiempo del carrito (`POST /api/carrito/renovar`)
- **Propósito:** Extiende el tiempo del carrito activo por N minutos adicionales (acción del usuario).
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Vacío.
- **Respuestas:**
  - `200 OK`: Retorna el carrito actualizado con nuevo `segundosRestantes`.
  - `410 GONE`: Si el carrito ya había expirado en el servidor antes de renovar.

### B. Restaurar productos de carrito expirado (`POST /api/carrito/restaurar`)
- **Propósito:** Recupera los productos del último carrito expirado y los agrega al carrito activo validando **stock y precios actuales**.
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Vacío.
- **Respuesta `200 OK`:**
  ```json
  {
    "carrito": {
      "id": 16,
      "items": [ ... ],
      "total": 300.00,
      "totalItems": 2,
      "expiracion": { "segundosRestantes": 3600, ... }
    },
    "itemsNoRestaurados": [
      {
        "productoId": 5,
        "nombre": "Camiseta Polo",
        "motivo": "SIN_STOCK",
        "cantidadSolicitada": 2,
        "cantidadRestaurada": 0
      },
      {
        "productoId": 8,
        "nombre": "Gorra Clásica",
        "motivo": "STOCK_PARCIAL",
        "cantidadSolicitada": 3,
        "cantidadRestaurada": 1
      }
    ]
  }
  ```
  - **Motivos posibles en `itemsNoRestaurados`:**
    - `"SIN_STOCK"`: El producto ya no tiene existencias.
    - `"STOCK_PARCIAL"`: Se restauró la cantidad máxima disponible (`cantidadRestaurada`).
    - `"NO_DISPONIBLE"`: El producto fue pausado o desactivado.
    - `"SIN_PRECIO"`: No hay precio de venta vigente configurado.

---

## 3. Manejo de Errores Semánticos (`HTTP 410 GONE`)

Cuando una mutación o el checkout intenta operar sobre un carrito que ya venció en el servidor, el backend responde con **HTTP 410 GONE**:

```json
{
  "error": "Tu carrito ha expirado por inactividad. Puedes iniciar uno nuevo o restaurar tus productos.",
  "codigo": "CARRITO_EXPIRADO"
}
```

> [!TIP]
> **Recomendación para el cliente HTTP:**  
> Detectar: `response.status === 410 && data.codigo === 'CARRITO_EXPIRADO'`.  
> **Evitar** comparar cadenas de texto como `message.includes('expir')`, ya que son frágiles ante cambios de redacción.

---

## 4. Lógica de UI / UX Recomendada para el Frontend

### 4.1 Temporizador Preciso en Frontend
- Al recibir cualquier respuesta del carrito, calcular un deadline local monótono:
  ```typescript
  const deadlineMs = performance.now() + (data.expiracion.segundosRestantes * 1000);
  ```
- No parsear `expiraAt` para calcular tiempo restante (evita bugs de zona horaria entre cliente y servidor).
- Cada mutación (`addToCart`, `updateQuantity`, etc.) refresca el deadline automáticamente gracias al *Sliding Expiration* del backend.

### 4.2 Revalidación al Volver a la Pestaña (`visibilitychange`)
Agregar en `CartProvider`:
```typescript
useEffect(() => {
  const onVisible = () => {
    if (!document.hidden && isAuthenticated) {
      void refreshCart();
    }
  };
  document.addEventListener('visibilitychange', onVisible);
  return () => document.removeEventListener('visibilitychange', onVisible);
}, [isAuthenticated, refreshCart]);
```

### 4.3 Pre-Alerta de Renovación ("¿Necesitas más tiempo?")
- Cuando `segundosRestantes <= avisoSegundosAntes` (ej. faltan menos de 10 minutos):
  - Mostrar un toast, banner sutil o badge en el Drawer del carrito:
    > *"Tu sesión de compra vencerá en X minutos. [Extender tiempo]"*
  - Al hacer clic en **[Extender tiempo]**, llamar a `POST /api/carrito/renovar` y actualizar el carrito.

### 4.4 Modal de Carrito Expirado
- Si `carritoAnteriorExpirado === true` (al consultar el carrito o agregar un ítem) o ante error `410 CARRITO_EXPIRADO`:
  - **No vaciar la UI en silencio ni dar error genérico.**
  - Mostrar un modal amigable:
    > **"Tu carrito anterior ha vencido por inactividad"**  
    > *Los precios o el inventario pueden haber cambiado mientras estabas ausente.*  
    > **[ Restaurar mis productos ]**  **[ Seguir comprando ]**
  - Al presionar **[ Restaurar mis productos ]**, invocar `POST /api/carrito/restaurar`. Si hay ítems en `itemsNoRestaurados`, mostrar un toast informando qué productos cambiaron de disponibilidad.
