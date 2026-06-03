import type { FormaPago } from '@/entities/order';
import type { ShippingOptionsApi, ShippingServiceApi } from './schemas/api';
import type { ShippingOptionsView, ShippingServiceCosts, ShippingServiceView } from './types';

const EMPTY_SHIPPING_COSTS: ShippingServiceCosts = {
    tarifa: 0,
    recargo: 0,
    enLinea: 0,
    contraEntrega: 0,
};

export function isPickupService(
    servicio: Pick<ShippingServiceApi, 'nombre'> | null | undefined
): boolean {
    if (!servicio?.nombre) return false;
    return servicio.nombre.toLowerCase().includes('retiro');
}

export function getShippingServiceCosts(
    servicio: ShippingServiceApi | null | undefined
): ShippingServiceCosts {
    if (!servicio) return EMPTY_SHIPPING_COSTS;
    const tarifa = servicio.tarifa;
    const recargo = servicio.recargoContraEntrega;
    return {
        tarifa,
        recargo,
        enLinea: servicio.costoEnLinea,
        contraEntrega: servicio.costoContraEntrega,
    };
}

/** Alias legacy (`envioHelpers.getServicioCostos`). */
export const getServicioCostos = getShippingServiceCosts;

export function resolveShippingCost(
    opciones: Pick<ShippingOptionsApi, 'envioGratis'>,
    servicio: ShippingServiceApi | null | undefined,
    formaPago: FormaPago = 'EN_LINEA'
): number {
    if (!servicio || opciones.envioGratis) return 0;
    const { enLinea, contraEntrega } = getShippingServiceCosts(servicio);
    return formaPago === 'CONTRA_ENTREGA' ? contraEntrega : enLinea;
}

export function resolveShippingCostInTotal(
    opciones: Pick<ShippingOptionsApi, 'envioGratis'>,
    servicio: ShippingServiceApi | null | undefined,
    formaPagoEnvio: FormaPago
): number {
    if (!servicio || opciones.envioGratis) return 0;
    if (formaPagoEnvio === 'CONTRA_ENTREGA') return 0;
    return resolveShippingCost(opciones, servicio, 'EN_LINEA');
}

export function mapShippingServiceToView(servicio: ShippingServiceApi): ShippingServiceView {
    return {
        ...servicio,
        isPickup: isPickupService(servicio),
    };
}

export function mapShippingOptionsToView(opciones: ShippingOptionsApi): ShippingOptionsView {
    const servicios = opciones.servicios.map(mapShippingServiceToView);
    return {
        envioGratis: opciones.envioGratis,
        montoMinimoGratis: opciones.montoMinimoGratis ?? null,
        pickupServices: servicios.filter((s) => s.isPickup),
        deliveryServices: servicios.filter((s) => !s.isPickup),
    };
}

export function partitionShippingServices(servicios: ShippingServiceApi[] = []) {
    const pickup: ShippingServiceView[] = [];
    const delivery: ShippingServiceView[] = [];
    for (const s of servicios) {
        const view = mapShippingServiceToView(s);
        if (view.isPickup) pickup.push(view);
        else delivery.push(view);
    }
    return { pickup, delivery };
}
