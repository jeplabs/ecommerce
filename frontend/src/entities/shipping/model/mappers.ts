import type { FormaPago } from '@/entities/order';
import type { ShippingOptionsApi, ShippingServiceApi } from './schemas/api';
import type { ShippingOptionsView, ShippingServiceCosts, ShippingServiceView } from './types';

export function isPickupService(servicio: Pick<ShippingServiceApi, 'nombre'>): boolean {
    return servicio.nombre.toLowerCase().includes('retiro');
}

export function getShippingServiceCosts(servicio: ShippingServiceApi): ShippingServiceCosts {
    const tarifa = servicio.tarifa;
    const recargo = servicio.recargoContraEntrega;
    return {
        tarifa,
        recargo,
        enLinea: servicio.costoEnLinea,
        contraEntrega: servicio.costoContraEntrega,
    };
}

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
