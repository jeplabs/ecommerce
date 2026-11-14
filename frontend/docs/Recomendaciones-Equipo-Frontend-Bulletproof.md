# Guía de Recomendaciones Técnicas para el Equipo de Frontend (Arquitectura Bulletproof React)

> **Audiencia:** Equipo de Ingeniería Frontend  
> **Fecha:** Noviembre 2026  
> **Contexto Arquitectónico:** El proyecto se encuentra en proceso de migración desde una estructura tipo Feature-Sliced Design (`pages/`, `widgets/`, `entities/`, `shared/`) hacia **Bulletproof React** (`app/`, `features/`, `components/`, `config/`, `lib/`, `hooks/`, `utils/`).

---

## 1. Mapa de Orientación: Archivos Activos (Bulletproof React) vs. Archivos Legacy

> [!CAUTION]
> **Advertencia crítica antes de tocar código:**  
> Existen componentes duplicados en `src/widgets/*` y `src/pages/*` que **ya NO están conectados al árbol de renderizado real** de [`AppRouter.tsx`](../src/app/router/AppRouter.tsx). Realizar cambios en `src/widgets/*` o `src/pages/*` no tendrá ningún efecto en la aplicación.

| Dominio / Funcionalidad | ✅ Archivos Activos (Bulletproof React — **MODIFICAR AQUÍ**) | ❌ Archivos Legacy / En Transición (**NO MODIFICAR**) |
| :--- | :--- | :--- |
| **Enrutamiento de Páginas** | [`src/app/router/AppRouter.tsx`](../src/app/router/AppRouter.tsx)<br/>`src/app/routes/**` (`cart.tsx`, `checkout/index.tsx`, `checkout/webpay-return.tsx`, `checkout/qpaypro-return.tsx`, `checkout/success.tsx`) | `src/pages/cart/**`<br/>`src/pages/checkout/**`<br/>`src/pages/checkout-success/**`<br/>`src/pages/admin/**` |
| **Carrito y Expiración** | [`src/features/cart/hooks/useCartLogic.ts`](../src/features/cart/hooks/useCartLogic.ts)<br/>[`src/features/cart/components/CartExpiredModal/CartExpiredModal.tsx`](../src/features/cart/components/CartExpiredModal/CartExpiredModal.tsx)<br/>`src/features/cart/components/CartView/CartView.tsx`<br/>`src/features/cart/components/CartDrawer/CartDrawer.tsx`<br/>[`src/app/providers/CartProvider.tsx`](../src/app/providers/CartProvider.tsx) | `src/widgets/cart/CartExpiredModal.tsx`<br/>`src/widgets/cart/CartExpirationBanner.tsx`<br/>`src/widgets/cart/CartDrawer.tsx`<br/>`src/widgets/cart/CartView.tsx`<br/>`src/entities/cart/**` |
| **Checkout y Pasarelas** | [`src/features/checkout/hooks/useCheckoutLogic.ts`](../src/features/checkout/hooks/useCheckoutLogic.ts)<br/>[`src/features/checkout/components/PaymentStep/PaymentStep.tsx`](../src/features/checkout/components/PaymentStep/PaymentStep.tsx)<br/>[`src/features/checkout/components/QPayProReturn/QPayProReturn.tsx`](../src/features/checkout/components/QPayProReturn/QPayProReturn.tsx)<br/>`src/features/checkout/components/CheckoutReturn/CheckoutReturn.tsx`<br/>[`src/features/checkout/api/paymentGatewayApi.ts`](../src/features/checkout/api/paymentGatewayApi.ts)<br/>[`src/features/checkout/types/payment.ts`](../src/features/checkout/types/payment.ts)<br/>[`src/features/checkout/lib/qpaypro-pending-order.ts`](../src/features/checkout/lib/qpaypro-pending-order.ts) | `src/widgets/checkout/**` (`CheckoutContent.tsx`, `CheckoutReturnView.tsx`, `CheckoutSuccessView.tsx`, `CheckoutView.tsx`)<br/>`src/entities/order/**` |
| **Admin (Productos)** | [`src/features/admin/components/ProductForm/ProductForm.tsx`](../src/features/admin/components/ProductForm/ProductForm.tsx)<br/>`src/features/admin/components/AdminProductNewView/**`<br/>`src/features/admin/components/AdminProductEditView/**` | `src/widgets/admin/**` (`AdminProductForm.tsx`, `AdminProductEditView.tsx`, `AdminProductNewView.tsx`) |
| **Moneda y Configuración** | [`src/app/providers/ConfigProvider.tsx`](../src/app/providers/ConfigProvider.tsx)<br/>[`src/app/providers/useConfig.ts`](../src/app/providers/useConfig.ts)<br/>[`src/utils/format.ts`](../src/utils/format.ts)<br/>`src/config/app-config.ts` | `src/shared/lib/format.ts` *(es solo un re-export de `@/utils/format`)*<br/>`src/shared/lib/app-config.ts` |

---

## 2. Contratos de Backend Ya Implementados (Listos para Consumir)

El equipo de Backend ya implementó las siguientes mejoras y endpoints que respaldan los cambios del Frontend:

1. **Detección de Carrito Expirado Post-Scheduler (`GET /api/carrito`):**
   - `CarritoService.obtenerOCrearCarritoVigente` ahora verifica si existe un carrito `EXPIRADO` con productos (`!c.getItems().isEmpty()`) cuando no hay carrito `ACTIVO`, devolviendo `expiracion.carritoAnteriorExpirado = true`.
2. **Normalización Monetaria (`CLP` sin decimales) y Blindaje en Pasarelas:**
   - `OrdenService.crear`, `ProductoService` e `IvaCalculator` normalizan todos los montos a la escala de `MonedaConfig` (`0` decimales en `CLP`, `2` en `GTQ`).
   - `WebpayService.iniciar` valida que la moneda activa sea `CLP` y garantiza que `orden.total`, `WebpayTransaccion.monto` y el monto enviado a Transbank sean enteros idénticos (evitando rechazos en el Caso 7 de confirmación).
   - `QPayProService.iniciarPago` valida que la moneda no sea `CLP` y redirige `x_url_cancel` a `/checkout/qpaypro/retorno?orden={id}&status=cancelled`.
3. **Nuevo Endpoint de Estado para QPayPro (`GET /api/pagos/qpaypro/estado/{ordenId}`):**
   - Devuelve `{ ordenId: number, estado: 'PENDIENTE' | 'APROBADA' | 'DENEGADA' | 'ANULADA', transactionId: string | null }`, cumpliendo 1:1 con `qpayproEstadoSchema` en [`src/features/checkout/types/payment.ts`](../src/features/checkout/types/payment.ts).
4. **Nuevo Endpoint para Cambiar Método de Pago en Orden `PENDIENTE` (`PATCH /api/ordenes/{id}/metodo-pago`):**
   - Recibe `{ metodoPagoCodigo: string, formaPagoEnvio: 'EN_LINEA' | 'CONTRA_ENTREGA' }` y actualiza el método de pago y costo de envío de una orden propia que siga en estado `PENDIENTE`.

---

## 3. Recomendación 1: Filtrado de Pasarelas por País en `PaymentStep.tsx` y Método por Defecto en `useCheckoutLogic.ts`

### Problema
1. [`PaymentStep.tsx`](../src/features/checkout/components/PaymentStep/PaymentStep.tsx#L60-L103) renderiza simultáneamente **QPayPro** (Guatemala) y **Webpay Plus** (Chile) sin consultar `useConfig()`.
2. En [`useCheckoutLogic.ts`](../src/features/checkout/hooks/useCheckoutLogic.ts#L103), el estado inicial de `paymentMethod` es `PAYMENT_METHODS.STRIPE` (método comentado en la UI) y cuando se selecciona envío express o retiro en tienda (líneas 239-251) fuerza el fallback a `PAYMENT_METHODS.WEBPAY` incluso si el país activo es Guatemala.

### Acción Recomendada para Frontend

#### A. En [`src/features/checkout/components/PaymentStep/PaymentStep.tsx`](../src/features/checkout/components/PaymentStep/PaymentStep.tsx)
Consumir `useConfig()` desde `@/app/providers` y mostrar únicamente la pasarela correspondiente al territorio activo:

```tsx
import { useCheckout, useConfig } from '@/app/providers';
// ...
export default function PaymentStep() {
    const { paymentMethod, setPaymentMethod, orderTotal, selectedServicio } = useCheckout();
    const { isChile, isGuatemala } = useConfig();
    // ...
```
- Renderizar el botón de **QPayPro** solo cuando `isGuatemala` sea `true` (o `!isChile`).
- Renderizar el botón de **Webpay Plus** solo cuando `isChile` sea `true`.

#### B. En [`src/features/checkout/hooks/useCheckoutLogic.ts`](../src/features/checkout/hooks/useCheckoutLogic.ts)
1. Inicializar `paymentMethod` según el país activo en `useConfig()`:
   - Si `isChile` ➔ `PAYMENT_METHODS.WEBPAY`
   - Si `isGuatemala` ➔ `PAYMENT_METHODS.QPAYPRO`
2. En el `useEffect` que desactiva `CONTRA_ENTREGA` para servicios express o retiro en tienda (líneas 239-251):
   ```ts
   useEffect(() => {
       if (
           selectedServicio &&
           (isExpressService(selectedServicio) || isPickupService(selectedServicio))
       ) {
           setPaymentMethod((prev) => {
               if (prev === PAYMENT_METHODS.CONTRA_ENTREGA) {
                   return isChile ? PAYMENT_METHODS.WEBPAY : PAYMENT_METHODS.QPAYPRO;
               }
               return prev;
           });
       }
   }, [selectedServicio, isChile]);
   ```

---

## 4. Recomendación 2: Resiliencia en Checkout ante Fallos al Iniciar Pasarela (`useCheckoutLogic.ts` + `orderApi.ts`)

### Problema
En [`useCheckoutLogic.ts`](../src/features/checkout/hooks/useCheckoutLogic.ts#L397-L466), `completeCheckout()` ejecuta primero `const orden = await orderApi.crearOrden(...)` (lo cual convierte y vacía el carrito en el backend) y luego llama a `iniciarWebpay({ ordenId: orden.id })` o `iniciarQPayPro({ ordenId: orden.id })`.
Si la llamada a la pasarela falla:
- El `catch` captura el error pero **pierde la referencia a `orden`**.
- Si el usuario vuelve a presionar **"Confirmar y pagar"**, el frontend vuelve a llamar a `orderApi.crearOrden(...)` y recibe `CarritoNoEncontradoException` ("No tienes un carrito activo").

### Acción Recomendada para Frontend

1. **Agregar `actualizarMetodoPago` en [`src/features/checkout/api/orderApi.ts`](../src/features/checkout/api/orderApi.ts):**
   ```ts
   async actualizarMetodoPago(
       ordenId: number,
       payload: { metodoPagoCodigo: string; formaPagoEnvio: FormaPagoEnvio }
   ): Promise<OrderApi>
   ```
   Que consuma `PATCH ${API_URL}/api/ordenes/${ordenId}/metodo-pago`.

2. **Guardar `pendingOrder` en [`src/features/checkout/hooks/useCheckoutLogic.ts`](../src/features/checkout/hooks/useCheckoutLogic.ts):**
   ```ts
   const [pendingOrder, setPendingOrder] = useState<OrderApi | null>(null);
   ```
   En `completeCheckout()`:
   - Si `pendingOrder` es `null`: crear la orden con `await orderApi.crearOrden(...)` y guardar `setPendingOrder(orden)`.
   - Si `pendingOrder` ya existe (reintento tras fallo de red o cambio de método):
     - Si el usuario cambió de método de pago (`pendingOrder.metodoPagoCodigo !== metodoPagoCodigo`), invocar `orden = await orderApi.actualizarMetodoPago(pendingOrder.id, { metodoPagoCodigo, formaPagoEnvio })` y actualizar `setPendingOrder(orden)`.
     - De lo contrario, reutilizar `orden = pendingOrder` directamente para llamar a `iniciarWebpay` o `iniciarQPayPro`.
   - En la guarda de redirección a `/cart` (líneas 195-200), incluir `pendingOrder`:
     ```ts
     useEffect(() => {
         if (processing || checkoutCompletedRef.current || showExpiredModal || pendingOrder) return;
         if (isEmpty) {
             navigate('/cart', { replace: true });
         }
     }, [isEmpty, navigate, processing, showExpiredModal, pendingOrder]);
     ```

---

## 5. Recomendación 3: Unificar el Polling de Recuperación para QPayPro y Webpay (Caso 5)

### Problema
En [`useCheckoutLogic.ts`](../src/features/checkout/hooks/useCheckoutLogic.ts#L485-L564), el `useEffect` de polling con backoff (`[2000, 5000, 15000, 30000]`) solo consulta `obtenerOrdenWebpayPendiente()` y `consultarEstadoWebpay(ordenId)`.

### Acción Recomendada para Frontend
Con el endpoint `GET /api/pagos/qpaypro/estado/{ordenId}` ya operativo en el backend:
1. En [`useCheckoutLogic.ts`](../src/features/checkout/hooks/useCheckoutLogic.ts), importar `obtenerOrdenQPayProPendiente`, `limpiarOrdenQPayProPendiente` (desde `../lib/qpaypro-pending-order`) y `consultarEstadoQPayPro` (desde `../api`).
2. Extender el `useEffect` de polling (o extraerlo a `useGatewayPolling.ts` en `src/features/checkout/hooks/`) para que verifique tanto `webpayPendienteId` como `qpayproPendienteId`:
   - Si detecta `qpayproPendienteId`:
     - Llamar a `consultarEstadoQPayPro(ordenId)`.
     - Si `estado.estado === 'APROBADA'`: ejecutar `limpiarOrdenQPayProPendiente()`, obtener la orden con `orderApi.obtenerOrden(ordenId)`, refrescar el carrito (`await refreshCartRef.current()`) y redirigir a `/checkout/success`.
     - Si `estado.estado === 'DENEGADA' || estado.estado === 'ANULADA'`: detener el polling y llamar a `limpiarOrdenQPayProPendiente()`.

---

## 6. Recomendación 4: Ciclo de Vida y UX de Expiración del Carrito (`useCartLogic.ts`)

### Acción Recomendada para Frontend
1. **Revalidación al abrir `CartDrawer` o entrar a `/cart`:**
   - En [`src/app/routes/cart.tsx`](../src/app/routes/cart.tsx) o al abrir `CartDrawer`, disparar `refreshCart()` cuando el usuario está autenticado para reflejar inmediatamente cualquier expiración ocurrida durante la navegación interna SPA.
2. **Limpieza explícita al cerrar sesión (`isAuthenticated === false`):**
   - En [`src/features/cart/hooks/useCartLogic.ts`](../src/features/cart/hooks/useCartLogic.ts#L132-L142), agregar `setShowExpiredModal(false)` y `setItemsNoRestaurados([])` dentro del bloque `else` cuando `isAuthenticated` pasa a `false`.

---

## 7. Recomendación 5: Prevención de Decimales en Admin para Moneda `CLP` (`ProductForm.tsx`)

### Problema
En [`src/features/admin/components/ProductForm/ProductForm.tsx`](../src/features/admin/components/ProductForm/ProductForm.tsx#L135), el estado inicial de `moneda` está hardcodeado en `'USD'` (líneas 135 y 196) y el `<Input type="number" id="price" />` (líneas 817-833) no define `step` ni valida decimales según la moneda seleccionada.

### Acción Recomendada para Frontend
En [`src/features/admin/components/ProductForm/ProductForm.tsx`](../src/features/admin/components/ProductForm/ProductForm.tsx):
1. Inicializar `moneda` usando `getCurrencyConfig().codigo` (de `@/utils/format`) en lugar de `'USD'`.
2. Ajustar dinámicamente `step` y `placeholder` en el `<Input id="price">`:
   ```tsx
   const isZeroDecimalCurrency = formData.moneda === 'CLP' || getCurrencyConfig().decimales === 0;
   ```
   ```tsx
   <Input
       type="number"
       id="price"
       name="price"
       value={formData.price}
       onChange={handleChange}
       min="0"
       step={isZeroDecimalCurrency ? '1' : '0.01'}
       placeholder={isZeroDecimalCurrency ? '0' : '0.00'}
       required
       invalid={!!errors.price}
   />
   ```
3. En `validateForm()` (línea 630), si `isZeroDecimalCurrency` es `true` y `!Number.isInteger(Number(price))`, agregar el mensaje `"Para pesos chilenos (CLP) el precio debe ser un número entero sin decimales"`.
