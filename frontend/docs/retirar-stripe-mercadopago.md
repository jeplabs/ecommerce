# Retirar Stripe y Mercado Pago del frontend

> 📌 **Decisión de equipo:** los métodos de pago **Stripe** y **Mercado Pago** se retiran del
> frontend (eran simulaciones demo). Se mantienen **QPayPro**, **Webpay Plus** y **Transferencia
> bancaria**. Este documento es la guía operativa para la limpieza; **la limpieza se hace a mano**,
> siguiendo el checklist en orden.

---

## 1. Contexto y alcance

- Ambos métodos están implementados como **simulación** (tarjetas de prueba estilo Stripe,
  redirección simulada de Mercado Pago). No hay integración real.
- En `PaymentStep` sus botones ya están **comentados**; el código vivo está en schemas, hook, API
  simulada, fixtures y tests.
- ⚠️ **Contrato con backend:** el enum de `metodoPago` del backend aún admite `STRIPE`/`MERCADO_PAGO`.
  Revisa el [Paso 6](#paso-6--contrato-con-el-backend-schemas-de-orden) antes de correr la app.

## 2. Impacto en cobertura de testing

| Aspecto | Efecto esperado |
|---------|-----------------|
| % de coverage (lines/statements) | **No baja; tiende a subir levemente** (94.5–95 % estimado vs 93.44 % actual) |
| Branches globales | Suben: se eliminan las ramas al ~50 % de `SimulatedStripeForm` |
| `useCheckoutLogic.ts` | Su gap principal (~78 % líneas) se reduce porque se va el flujo Stripe/MP sin cubrir |
| Componentes borrados | `SimulatedStripeForm`/`SimulatedMercadoPagoForm` están ~100 % cubiertos: al borrarlos numerador y denominador bajan juntos → ratio igual |
| Conteo de tests | **326 → ~318–321** (según cuántos casos se eliminen) |
| Archivos de test | **67 → 65** (se borran 2 archivos de test de componentes) |
| Umbrales (`vite.config.ts`: 90/90/85/90) | Siguen pasando, con más margen |
| `features/checkout/api/paymentApi.ts` | Su limpieza **no afecta los umbrales**: esa carpeta **no está** en `coverage.include` |

> Nota: `features/checkout/api/**` no está en el `include` de cobertura de `vite.config.ts`. Es un
> hueco de config conocido; si luego quieres que pese en el umbral, agrega el glob y cúbrelo.

## 3. Checklist de limpieza (en orden)

> Los números de línea son referenciales (usa Ctrl+F por el símbolo o nombre si se mueven).

### Paso 1 — Eliminar los componentes completos

| Acción | Archivos |
|--------|----------|
| Eliminar carpeta completa | `src/features/checkout/ui/SimulatedStripeForm/` → `SimulatedStripeForm.tsx`, `SimulatedStripeForm.module.css`, `SimulatedStripeForm.test.tsx` |
| Eliminar carpeta completa | `src/features/checkout/ui/SimulatedMercadoPagoForm/` → `SimulatedMercadoPagoForm.tsx`, `SimulatedMercadoPagoForm.module.css`, `SimulatedMercadoPagoForm.test.tsx` |

### Paso 2 — Schemas de pago y barriles

- `src/features/checkout/model/schemas/payment.ts`
  - `paymentMethodSchema` (línea ~6): quitar `'stripe'` y `'mercadopago'` del `z.enum`.
  - `PAYMENT_METHODS.STRIPE` (~9) y `PAYMENT_METHODS.MERCADOPAGO` (~12): quitar.
  - `stripeCardFormSchema` (~25) y `type StripeCardFormValues` (~32): quitar.
  - `processPaymentInputSchema` (~38): quitar la propiedad `cardData`.
- `src/features/checkout/index.ts`
  - Re-exporta `stripeCardFormSchema` (~12) y `type StripeCardFormValues` (~19): **quitar**, o el
    build rompe con el Paso 2 anterior.
- `src/features/checkout/api/index.ts`
  - Re-exporta `PAYMENT_METHODS` (vía `paymentApi`). Revisar que siga resolviendo tras el Paso 4.

### Paso 3 — Hook `useCheckoutLogic`

`src/features/checkout/model/useCheckoutLogic.ts`:

- Import `StripeCardFormValues` (~8): quitar.
- Estado `cardData` (~99) y `updateCardField` (~272): quitar junto con el tipo `StripeCardFormValues`.
- **Default de `paymentMethod` (~85):** hoy es `PAYMENT_METHODS.STRIPE`. Cambiarlo a
  `PAYMENT_METHODS.QPAYPRO` (o `WEBPAY`).
- Rama de validación Stripe (~250): quitar.
- `cardData` al procesar el pago (~307): quitar.
- Ramas de `MERCADOPAGO` (~249) y mapeos a `'STRIPE'`/`'MERCADO_PAGO'` (~195, 328–330): quitar.

### Paso 4 — API simulada

`src/features/checkout/api/paymentApi.ts` (simulada; **no pesa en coverage** pero es código vivo):

- Import del tipo `StripeCardFormValues` (~7): quitar.
- `STRIPE_TEST_CARDS` (~13), `[PAYMENT_METHODS.STRIPE]: 'pi_sim'` (~21),
  `[PAYMENT_METHODS.MERCADOPAGO]: 'MP_SIM'` (~23): quitar.
- `validateStripeCard` (~33) y sus topes de pago (~51, ~53): quitar.
- Ramas `STRIPE` (~75–99) y `MERCADOPAGO` (~117–121) dentro de `processPayment`: quitar.
- Comentario que menciona "Stripe.js, Webpay Plus o Mercado Pago" (~60): actualizar.

### Paso 5 — `PaymentStep` (solo comentarios)

`src/features/checkout/ui/PaymentStep/PaymentStep.tsx`:

- Botón **comentado** de Tarjeta (Stripe) (~38–51) y de Mercado Pago (~67–80): borrar los comentarios.
- Import comentado de `SimulatedMercadoPagoForm` (~9) y render comentado (~143): borrar.
- Sin impacto en coverage (son comentarios), pero limpia el archivo.

### Paso 6 — Contrato con el backend (schemas de orden)

> ⚠️ **Atención aquí:** es lo que define qué `metodoPago` se manda al backend.

- `src/entities/order/model/schemas/api.ts`
  - Enum `metodoPago` con `'STRIPE'` (~25) y `'MERCADO_PAGO'` (~27): quitar (revisar que el backend
    ya no los use o coordinar el cambio).
- `src/entities/order/model/schemas/forms.ts`
  - `metodoPagoCodigoSchema` con `'STRIPE'` (~6) y `'MERCADO_PAGO'` (~8): quitar.
  - `mapCheckoutFormToCreateOrderRequest` (~48–55): hoy el **fallback es `: 'STRIPE'`** (~55), así que
    **QPayPro y contra_entrega se envían como `'STRIPE'`** al backend. Al limpiar, mapea los códigos
    nuevos (p. ej. `'QPAYPRO'`, `'CONTRA_ENTREGA'`) o el backend rechazará esas órdenes.

### Paso 7 — Tests a ajustar

- `src/features/checkout/model/useCheckoutLogic.test.tsx`
  - Test "requiere tarjeta completa para pagar con Stripe" (~77): eliminar o reescribir.
  - Mocks que usan `PAYMENT_METHODS.STRIPE` como default: alinear con el nuevo default del hook.
- `src/features/checkout/api/paymentApi.test.ts`
  - Casos Stripe (~92–98) y Mercado Pago (~113–114): eliminar. Mantener los casos de QPayPro, WebPay
    y transferencia que sigan existiendo.
- `src/features/checkout/ui/success/OrderConfirmationSummary/OrderConfirmationSummary.test.tsx`
  - Usa `provider: 'STRIPE'` (~78, ~85) solo como etiqueta de ejemplo: cambiar por otro (p. ej.
    `'WEBPAY'`).

### Paso 8 — Fixtures / MSW

- `src/test/msw/fixtures/orders.ts` — default `metodoPago = 'STRIPE'` (~42): cambiar.
- `src/test/msw/fixtures/orders-registry.ts` — `metodoPago: 'STRIPE'` (~39): cambiar.
- `src/test/msw/handlers.ts` — mapeo de `'MERCADO_PAGO'`/`'STRIPE'` (~498–500): quitar/ajustar.
- `src/test/checkoutMock.ts` — `cardData` y `updateCardField` (~56–62): quitar si el hook ya no los
  expone (si se dejan, son inofensivos, pero conviene alinearlos con el Paso 3).

## 4. Verificación final

```bash
# 1. Typescript y lint sin errores
pnpm exec tsc --noEmit
pnpm lint

# 2. Suite completa de tests
pnpm exec vitest run --pool=threads

# 3. Cobertura (debe seguir pasando con los umbrales 90/90/85/90)
pnpm test:coverage
```

Criterios de aceptación:

- `npx vitest run --pool=threads` → todos los tests verdes (esperado: ~318–321 tests, 65 archivos).
- `pnpm test:coverage` → pasa los umbrales de `vite.config.ts`.
- `Ctrl+F` en `src/` de `stripe` / `mercado` (insensible a mayúsculas) → **0 resultados**.

## 5. Pendientes posteriores a la limpieza

- Actualizar `docs/testing.md`:
  - Conteo "326 tests · 67 archivos" → el nuevo (aprox. 320 · 65).
  - Bullet de Fase 7 que lista `SimulatedStripeForm`/`SimulatedMercadoPagoForm` como cubiertos
    (ahora serán "retirados").
  - Tabla "Qué falta para llegar a ~100 %": el gap de `useCheckoutLogic` baja al retirar Stripe/MP.
- Revisar `docs/payment-gateways.md`: su título/descripción menciona Stripe y Mercado Pago.
- Decidir si `features/checkout/api/**` entra al `coverage.include` de `vite.config.ts`.

## Referencias

- `docs/testing.md` → secciones "Cobertura y umbrales", "Qué falta para llegar a ~100 %",
  "Buenas prácticas de configuración" e "Impacto en cobertura de retirar Stripe y Mercado Pago".
- `docs/payment-gateways.md` → contexto de las pasarelas (demo vs real).
