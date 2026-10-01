import ShippingServiceSelector from '../ShippingServiceSelector/ShippingServiceSelector';

/**
 * Paso 1: dirección / sucursal + servicio de entrega (+ notas).
 * Los ítems del pedido se muestran en el resumen lateral.
 */
export default function ReviewAndShippingStep() {
    return <ShippingServiceSelector />;
}

