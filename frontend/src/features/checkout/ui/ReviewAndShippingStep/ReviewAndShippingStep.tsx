import { useCheckout } from '@/app/providers';

import ShippingServiceSelector from '../ShippingServiceSelector/ShippingServiceSelector';
import ShippingAddressSelector from './ShippingAddressSelector';
import PickupBranchSelector from '../PickupBranchSelector/PickupBranchSelector';

/**
 * Paso 1: dirección + servicio de entrega (+ notas).
 * Los ítems del pedido se muestran en el resumen lateral.
 */
export default function ReviewAndShippingStep() {
    const { isPickupSelected, selectedServicioEnvioId } = useCheckout();

    return (
        <>
            <ShippingServiceSelector />
            {isPickupSelected && <PickupBranchSelector />}
            {!isPickupSelected && selectedServicioEnvioId != null && <ShippingAddressSelector />}
        </>
    );
}
