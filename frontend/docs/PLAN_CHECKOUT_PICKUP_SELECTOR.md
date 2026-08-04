# Plan: Checkout Step 1 — Selector condicional de dirección vs sucursal

## Contexto

En el paso 1 del checkout ("Pedido y envío"), actualmente se muestran siempre dos componentes:
1. `ShippingServiceSelector` — selector de forma de entrega (retiro, normal, express)
2. `ShippingAddressSelector` — selector de dirección de envío

El usuario quiere que:
- Si selecciona **retiro en tienda** → aparezca un componente de selección de sucursal (nuevo)
- Si selecciona **envío normal o express** → aparezca el selector de dirección (existente)
- **Por defecto** no aparezca ninguno de los dos selectores hasta que el usuario elija una forma de entrega

---

## Archivos relevantes

| Archivo | Rol |
|---|---|
| `features/checkout/ui/ReviewAndShippingStep/ReviewAndShippingStep.tsx` | Orquestador del paso 1 — renderiza ambos selectores |
| `features/checkout/ui/ReviewAndShippingStep/ShippingAddressSelector.tsx` | Selector de dirección (existente) |
| `features/checkout/ui/ShippingServiceSelector/ShippingServiceSelector.tsx` | Selector de forma de entrega |
| `features/checkout/model/useCheckoutLogic.ts` | Estado del checkout — tiene `isPickupSelected`, auto-selección |

---

## Estado actual del flujo

```
useCheckoutLogic (mount)
  → fetchDirecciones() → auto-selecciona dirección principal
  → shipping options load → auto-selecciona "normal" (líneas 150-172)

ReviewAndShippingStep
  → <ShippingServiceSelector />     ← siempre visible
  → <ShippingAddressSelector />     ← siempre visible
```

**Problema:** La auto-selección del servicio "normal" hace que `selectedServicioEnvioId` nunca sea `null` después del mount, lo que impide distinguir "el usuario eligió" de "se seleccionó por defecto".

---

## Plan paso a paso

### Paso 1: Eliminar auto-selección del servicio de envío

**Archivo:** `features/checkout/model/useCheckoutLogic.ts`

**Qué hacer:** Eliminar el `useEffect` de las líneas 150-172 que auto-selecciona el servicio "normal" cuando las opciones de envío cargan.

**Por qué:** Si el servicio se auto-selecciona, el usuario nunca ve el estado "vacío" donde no aparece ningún sub-selector. El usuario debe hacer clic explícitamente en una opción para que aparezca el componente correspondiente.

**Impacto:**
- `selectedServicioEnvioId` queda en `null` hasta que el usuario haga clic
- `selectedServicio` será `null` → `isPickupSelected` será `false`
- `canContinueShipping` será `false` (requiere `selectedServicioEnvioId`) → botón "Continuar al pago" deshabilitado hasta que el usuario elija
- En el paso 2, `selectedServicio` será `null` → `isExpressService(null)` retorna `false` → contraentrega se muestra (correcto, porque el usuario aún no eligió)

### Paso 2: Modificar `ReviewAndShippingStep` para renderizado condicional

**Archivo:** `features/checkout/ui/ReviewAndShippingStep/ReviewAndShippingStep.tsx`

**Qué hacer:** Reemplazar el renderizado actual por lógica condicional:

```tsx
import { useCheckout } from '@/app/providers';
import ShippingServiceSelector from '../ShippingServiceSelector/ShippingServiceSelector';
import ShippingAddressSelector from './ShippingAddressSelector';
import PickupBranchSelector from '../PickupBranchSelector/PickupBranchSelector';

export default function ReviewAndShippingStep() {
    const { isPickupSelected, selectedServicioEnvioId } = useCheckout();

    return (
        <div>
            <ShippingServiceSelector />

            {isPickupSelected && <PickupBranchSelector />}

            {!isPickupSelected && selectedServicioEnvioId != null && (
                <ShippingAddressSelector />
            )}
        </div>
    );
}
```

**Por qué:**
- `isPickupSelected` es `true` solo si el servicio seleccionado es retiro → muestra sucursal
- `selectedServicioEnvioId != null` significa que el usuario ya eligió un servicio (no es null) y NO es retiro → muestra dirección
- Si `selectedServicioEnvioId` es `null` (usuario no ha elegido) → no muestra ninguno de los dos

### Paso 3: Crear componente `PickupBranchSelector`

**Archivos nuevos:**
- `features/checkout/ui/PickupBranchSelector/PickupBranchSelector.tsx`
- `features/checkout/ui/PickupBranchSelector/PickupBranchSelector.module.css`

**Qué hacer:** Componente que muestra sucursales de retiro como tarjetas de radio (mismo patrón que `ShippingAddressSelector`). Datos mockeados por ahora.

**Estructura del componente:**
```tsx
// Datos mockeados (temporal, hasta que el backend provea sucursales)
const MOCK_BRANCHES = [
    {
        id: 1,
        nombre: 'Tienda Centro',
        direccion: 'Av. Principal 123, Ciudad de Guatemala',
        horario: 'Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00',
        telefono: '+502 2345-6789',
    },
    {
        id: 2,
        nombre: 'Tienda Zona 10',
        direccion: 'Boulevard Los Proceres 5-50, Zona 10',
        horario: 'Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00',
        telefono: '+502 2456-7890',
    },
];
```

**Lógica:**
- Estado local: `selectedBranchId` (número | null)
- Renderiza título "Sucursal de retiro", subtítulo explicativo
- Lista de tarjetas radio con nombre, dirección, horario, teléfono
- Guarda la selección en estado local (por ahora, hasta que se conecte al backend)
- **Nota:** La selección de sucursal NO se conecta al checkout global aún — es simulación

**Estilo:** Seguir el patrón de `ShippingAddressSelector` — tarjetas con `.card`, `.cardSelected`, `.cardBody`, `.cardHeader`, `.cardLine`, `.cardMeta`. Copiar los estilos de `ShippingStep.module.css` o importar los mismos estilos.

### Paso 4: Ajustar `canContinueShipping` para pickup

**Archivo:** `features/checkout/model/useCheckoutLogic.ts`

**Qué hacer:** Modificar `canContinueShipping` para que cuando pickup esté seleccionado, NO requiera `selectedAddressId`:

```tsx
const canContinueShipping =
    Boolean(selectedServicioEnvioId) &&
    !loadingAddresses &&
    !loadingEnvioOpciones &&
    !envioOpcionesError &&
    servicios.length > 0 &&
    (isPickupSelected ? Boolean(selectedBranchId) : Boolean(selectedAddressId));
```

**Por qué:** Si el usuario eligió retiro en tienda, no necesita seleccionar dirección de envío. Solo necesita seleccionar una sucursal.

**Detalle:** `selectedBranchId` se expondrá desde el contexto del checkout o se pasará como prop. Por ahora, como es simulación, se puede mantener `selectedAddressId` como requerido para ambos casos y ajustar después.

**Decisión:** Por simplicidad en esta fase de simulación, **no se ajusta `canContinueShipping`** — se mantiene requiriendo dirección para todos los casos. El ajuste se hace cuando se conecte la lógica de sucursales al backend.

### Paso 5: Eliminar pickup note de `ShippingServiceSelector`

**Archivo:** `features/checkout/ui/ShippingServiceSelector/ShippingServiceSelector.tsx`

**Qué hacer:** Eliminar o condicionar el bloque de pickup note (líneas 197-202):

```tsx
{isPickupSelected && (
    <p className={styles.pickupNote}>
        Retirarás el pedido en nuestra tienda. La dirección seleccionada arriba se usa como
        contacto y referencia del pedido.
    </p>
)}
```

**Por qué:** Este mensaje ya no aplica — cuando se selecciona retiro, se muestra el selector de sucursal, no el de dirección. El mensaje de "la dirección seleccionada arriba" es confuso porque ya no hay dirección arriba.

**Opción:** Reemplazar por un mensaje más corto tipo "Selecciona la sucursal donde retirarás tu pedido" que se muestre al seleccionar retiro. O simplemente eliminarlo y dejar que `PickupBranchSelector` maneje su propio subtítulo.

---

## Resumen de cambios

| Archivo | Cambio |
|---|---|
| `useCheckoutLogic.ts` | Eliminar useEffect de auto-selección (líneas 150-172) |
| `ReviewAndShippingStep.tsx` | Renderizado condicional: pickup → sucursal, delivery → dirección |
| `PickupBranchSelector.tsx` | **Nuevo** — selector de sucursal con datos mock |
| `PickupBranchSelector.module.css` | **Nuevo** — estilos del selector de sucursal |
| `ShippingServiceSelector.tsx` | Eliminar/condicionar pickup note (líneas 197-202) |

---

## Orden de implementación

1. Eliminar auto-selección en `useCheckoutLogic.ts`
2. Crear `PickupBranchSelector` con datos mock
3. Modificar `ReviewAndShippingStep.tsx` para renderizado condicional
4. Limpiar pickup note en `ShippingServiceSelector.tsx`
5. Typecheck

---

## Preguntas

1. ¿Los datos mock de sucursales están bien como punto de partida, o quieres que hardcodee algo específico?
2. ¿La selección de sucursal se guarda en algún estado del checkout global, o por ahora solo es visual?
