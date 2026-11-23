# Expiración y Sincronización del Carrito en Checkout

Este documento recoge en detalle el diagnóstico técnico del comportamiento actual de la expiración del carrito en `/checkout`, los problemas de experiencia de usuario (UX) identificados, las mejores prácticas de la industria en comercio electrónico, las 3 alternativas evaluadas y la viabilidad técnica de combinar las alternativas B y C.

---

## 1. Diagnóstico: ¿Qué ocurre actualmente si el carrito expira en `/checkout`?

Si un usuario se encuentra en `/checkout` y el carrito expira (ya sea porque el contador del cliente llegó a cero o porque el backend invalidó la sesión de carrito), ocurren 4 situaciones críticas:

### 1. Redirección abrupta e inesperada a `/cart`
En [`useCheckoutLogic.ts`](../src/features/checkout/model/useCheckoutLogic.ts#L193-L198) existe el siguiente efecto:
```typescript
useEffect(() => {
    if (processing || checkoutCompletedRef.current) return;
    if (isEmpty) {
        navigate('/cart', { replace: true });
    }
}, [isEmpty, navigate, processing]);
```
Cuando el carrito expira, [`useCartLogic`](../src/entities/cart/model/useCartLogic.ts) limpia los items (`items: []`), lo que hace que `isEmpty` pase a `true`.
* **Resultado:** El usuario es "expulsado" de golpe del checkout a `/cart`, perdiendo el contexto de lo que estaba llenando (datos de envío, selección de método de pago, notas, etc.).

### 2. Cero visibilidad del tiempo restante en Checkout
* El banner con el temporizador ([`CartExpirationBanner`](../src/widgets/cart/CartExpirationBanner.tsx)) solo está montado en [`CartView.tsx`](../src/pages/CartView.tsx).
* En la página de Checkout ([`CheckoutView.tsx`](../src/pages/CheckoutView.tsx)), el usuario **no tiene ningún indicador visible** de que sus productos tienen un tiempo límite de reserva. La expiración le llega por sorpresa.

### 3. Colisión con el Modal de Expiración
* Aunque el [`CartExpiredModal`](../src/widgets/cart/CartExpiredModal.tsx) está montado a nivel global en el proveedor de la app, al ocurrir la redirección forzada a `/cart`, el modal se abre sobre la página del carrito en lugar de permitirle al usuario entender qué pasó en la pantalla donde estaba comprando.

### 4. Expiración en el momento del envío (`completeCheckout`)
* Si el usuario hace clic en "Completar pedido" justo cuando el backend considera expirado el carrito:
  * La API devuelve `410 GONE` (`CARRITO_EXPIRADO`).
  * [`useCheckoutLogic.ts`](../src/features/checkout/model/useCheckoutLogic.ts#L430) captura el 410 y hace `refreshCart()`, pero termina retornando un error genérico: `err.message || 'Tu carrito ha expirado'`.
  * El usuario ve un texto de error en rojo en lugar de una opción guiada para restaurar sus productos si aún hay stock.

---

## 2. Estándares y Mejores Prácticas de la Industria (Amazon, Shopify, Ticketmaster)

En el funnel de conversión, **Checkout es la pantalla más sensible**. Una interrupción abrupta genera desconfianza y abandono de compra:

1. **Visibilidad Continua (Reserva de Stock):**
   Comunicar la expiración no como una amenaza, sino como un beneficio de reserva: *"Tus productos están reservados por 14:32 min"*.
2. **Prevención y Extensión de Tiempo:**
   Si el usuario está activo (ej. escribiendo la dirección o los datos de pago), ofrecer un botón o aviso cuando falten pocos minutos: *"¿Necesitas más tiempo para completar tu compra?"* y permitir renovar la reserva.
3. **Manejo en el Lugar (In-Place Handling):**
   **Nunca expulsar al usuario sin aviso**. Si el carrito expira en checkout, se debe pausar la pantalla y mostrar el diálogo de expiración ahí mismo, con la opción de *"Verificar disponibilidad y reintentar"* sin perder la información ya escrita en el formulario.

---

## 3. Alternativas de Implementación Evaluadas

### Alternativa A: Solución Mínima / Preventiva
* **Qué hace:**
  1. Incrustar el [`CartExpirationBanner`](../src/widgets/cart/CartExpirationBanner.tsx) existente dentro del resumen lateral de checkout ([`OrderSummary.tsx`](../src/features/checkout/ui/OrderSummary.tsx)) para que el usuario siempre vea los minutos que le quedan.
  2. Modificar la redirección en `useCheckoutLogic.ts`: si `isEmpty` se vuelve true pero la causa es que el modal de expiración está abierto, **no redirigir** automáticamente, permitiendo que el usuario vea el modal y decida.
* **Pros:** Se implementa en muy pocas líneas aprovechando los componentes ya existentes.
* **Contras:** Si el carrito se restaura, el usuario aún podría requerir recargar el paso.

---

### Alternativa B: Estándar E-commerce (Recomendada)
* **Qué hace:**
  1. **Indicador de reserva sutil en Checkout:** Añadir una barra o aviso en `OrderSummary` indicando el tiempo restante de reserva.
  2. **Pausa en Checkout al expirar:** Si el timer llega a cero estando en `/checkout`, se deshabilita temporalmente el botón de pago y se levanta `CartExpiredModal` en esa misma pantalla.
  3. **Acción de Restauración Contextual:** Si el usuario pulsa *"Restaurar carrito"*, se llama a la API para revalidar stock. Si los productos siguen disponibles, se actualiza el carrito y el usuario **sigue en el Checkout sin perder los datos que ya escribió en el formulario de dirección o envío**.
  4. **Mapeo semántico del error 410:** Si al dar clic en "Completar pedido" el backend responde con 410, en lugar de mostrar un error genérico en rojo, se abre directamente el flujo de restauración de carrito.
* **Pros:** Excelente UX, minimiza la fricción, preserva los datos ingresados por el usuario y rescata compras que de otro modo se perderían.
* **Contras:** Requiere conectar el estado del modal de expiración con el hook de checkout.

---

### Alternativa C: Avanzada (Renovación Proactiva / "Necesito más tiempo")
* **Qué hace:**
  * Todo lo de la Alternativa B, más:
  * Cuando falten 2 o 3 minutos, aparece un toast/aviso flotante: *"Tu reserva está por vencer. ¿Necesitas más tiempo?"* con un botón *"Extender 15 minutos"*, que consume el endpoint de renovación (`POST /api/carrito/renovar`) sin interrumpir lo que el usuario está escribiendo.
* **Pros:** La experiencia más pulida posible (estilo Ticketmaster / aerolíneas).
* **Contras:** Mayor complejidad de lógica para gestionar el aviso preventivo.

---

## 4. ¿Es posible hacer la Alternativa B y la Alternativa C juntas?

**Sí, totalmente. De hecho, es lo ideal y representa el estándar de oro en e-commerce.**

Ambas alternativas no compiten ni se excluyen entre sí, sino que cubren **momentos diferentes y complementarios** del ciclo de vida de la compra:

```
[ Usuario llenando checkout ]
         │
         ▼ (Faltan pocos minutos)
    【 Fase C: Prevención 】
    • Ve el contador: "Artículos reservados por 4:50 min"
    • Aparece aviso: "¿Necesitas más tiempo?" [Extender 15 min]
    • Si hace clic: llama a POST /api/carrito/renovar y resetea el reloj.
         │
         ▼ (Si no extendió y el tiempo llega a 0, o si el servidor da 410 al pagar)
    【 Fase B: Retención y Rescate 】
    • NO se le expulsa abruptamente a /cart.
    • Se pausa la pantalla en el Checkout y se abre CartExpiredModal.
    • Los datos de su formulario (dirección, envío, notas) NO se pierden.
    • Al hacer clic en "Restaurar productos": llama a POST /api/carrito/restaurar.
    • Si hay stock, se revalida y sigue en el checkout listo para pagar.
```

### Por qué encajan a la perfección:
1. **El backend ya tiene ambos endpoints listos:**
   * `POST /api/carrito/renovar` (para la extensión de la opción C).
   * `POST /api/carrito/restaurar` (para la recuperación in-place de la opción B).
   * Los metadatos de expiración ya vienen en la respuesta del carrito (`segundosRestantes`, `avisoSegundosAntes`, `ttlTotalSegundos`, `carritoAnteriorExpirado`).
2. **La fase C previene el problema:** Evita que el carrito expire si el usuario se toma su tiempo para buscar la tarjeta bancaria o escribir los detalles de su dirección.
3. **La fase B resuelve el caso de borde inevitable:** Si el usuario se alejó de la pantalla y el tiempo finalmente se agotó, o si el backend respondió `410 GONE` al momento exacto de procesar el pago, el usuario no es expulsado ni pierde los datos completados en el formulario.

---

## 5. Resumen de lo Implementado (Fusión B + C en Producción)

- [x] **1. Nuevo componente de reserva y extensión en Checkout (Fase C - Prevención)**
  * **Archivos creados**:
    * [`frontend/src/features/checkout/ui/CheckoutReservationBanner/CheckoutReservationBanner.tsx`](../src/features/checkout/ui/CheckoutReservationBanner/CheckoutReservationBanner.tsx)
    * [`frontend/src/features/checkout/ui/CheckoutReservationBanner/CheckoutReservationBanner.module.css`](../src/features/checkout/ui/CheckoutReservationBanner/CheckoutReservationBanner.module.css)
  * **Comportamiento**:
    * Se conecta con `CartContext` y muestra el tiempo restante sincronizado con el servidor en formato `mm:ss` (ej: *"Reserva: 14:32"*).
    * Cuando el tiempo restante entra en el umbral de advertencia (`avisoSegundosAntes` o $\le 10$ minutos), cambia de estilo y despliega el botón **"Extender"**.
    * Al pulsar **"Extender"**, ejecuta `renovarCart()`, que llama a `POST /api/carrito/renovar` del backend y resetea el reloj sin recargar la página ni perder datos.
    * Si el tiempo llega a un nivel crítico ($\le 3$ minutos), pasa a color rojo con ícono de alerta para apremiar la finalización de la compra.

- [x] **2. Integración en el Resumen del Pedido (`OrderSummary.tsx`)**
  * **Archivo modificado**:
    * [`frontend/src/features/checkout/ui/OrderSummary/OrderSummary.tsx`](../src/features/checkout/ui/OrderSummary/OrderSummary.tsx)
  * **Comportamiento**:
    * Se incrustó `<CheckoutReservationBanner />` al inicio del resumen lateral del pedido.
    * Como `OrderSummary` acompaña al usuario tanto en el paso 1 (Revisión y envío) como en el paso 2 (Pago), el usuario siempre tiene presente el tiempo de reserva y la posibilidad de extenderlo.

- [x] **3. Conexión del estado de expiración a la lógica de Checkout**
  * **Archivos modificados**:
    * [`frontend/src/app/providers/checkout-context.ts`](../src/app/providers/checkout-context.ts)
    * [`frontend/src/app/providers/CheckoutProvider.tsx`](../src/app/providers/CheckoutProvider.tsx)
  * **Comportamiento**:
    * Se extrae `showExpiredModal` desde `useCart()` y se le transfiere a `useCheckoutLogic` y a `CheckoutContext`.

- [x] **4. Protección contra redirección sorpresa y congelamiento seguro (Fase B - Retención)**
  * **Archivos modificados**:
    * [`frontend/src/features/checkout/model/useCheckoutLogic.ts`](../src/features/checkout/model/useCheckoutLogic.ts)
    * [`frontend/src/features/checkout/ui/CheckoutContent/CheckoutContent.tsx`](../src/features/checkout/ui/CheckoutContent/CheckoutContent.tsx)
  * **Comportamiento**:
    * **Sin expulsiones**: Se añadió la guarda `showExpiredModal` en el `useEffect` de redirección:
      ```typescript
      useEffect(() => {
          if (processing || checkoutCompletedRef.current || showExpiredModal) return;
          if (isEmpty) {
              navigate('/cart', { replace: true });
          }
      }, [isEmpty, navigate, processing, showExpiredModal]);
      ```
    * **Pantalla estable**: En `CheckoutContent.tsx`, si el carrito se vacía por expiración (`isEmpty && showExpiredModal`), la pantalla **no se reemplaza** por el texto de "Preparando checkout…". La interfaz se mantiene visible de fondo y se despliega centrado el `CartExpiredModal`.
    * **Bloqueo de avance en estado expirado**: Las banderas `canContinueShipping` y `canContinuePayment` se deshabilitan automáticamente si `isEmpty` o `showExpiredModal` son verdaderos, impidiendo enviar una orden con el carrito vencido.
    * **Restauración in-place**: Si el cliente pulsa *"Restaurar productos"* en el modal, se ejecuta `POST /api/carrito/restaurar`, los productos revalidados vuelven al carrito (`isEmpty` pasa a `false`), el modal se cierra y el usuario **sigue en el Checkout con su dirección, notas y método de envío completados sin tener que volver a escribirlos**.
    * Si el cliente pulsa *"Continuar sin restaurar"* o cierra el diálogo, entonces sí se le redirige limpiamente a `/cart`.

- [x] **5. Manejo semántico de error 410 GONE al completar el pedido**
  * **Archivo modificado**:
    * [`frontend/src/features/checkout/model/useCheckoutLogic.ts`](../src/features/checkout/model/useCheckoutLogic.ts#L458)
  * **Comportamiento**:
    * Si el carrito expiró en el servidor justo al dar clic en "Completar pedido", el backend responde `410 GONE`.
    * Se captura el 410, se invoca `await refreshCart()` (lo que levanta `CartExpiredModal` en `useCartLogic`) y se devuelve un mensaje contextual amigable: *"Tu reserva ha expirado. Puedes restaurar tus productos para continuar."*, evitando textos rojos crudos de error.

- [x] **6. Pruebas unitarias y de integración**
  * **Archivos con pruebas añadidas**:
    * [`frontend/src/features/checkout/ui/CheckoutReservationBanner/CheckoutReservationBanner.test.tsx`](../src/features/checkout/ui/CheckoutReservationBanner/CheckoutReservationBanner.test.tsx): 4 tests cubriendo el renderizado condicional, formateo a `mm:ss`, aparición del botón de extender y la llamada a `renovarCart()`.
    * [`frontend/src/features/checkout/model/useCheckoutLogic.test.tsx`](../src/features/checkout/model/useCheckoutLogic.test.tsx): test validando el bloqueo de los botones de pago/envío ante carrito vacío o expirado.
  * **Resultado del test suite**: **88 archivos pasaron / 423 tests pasaron (0 fallas)**.
