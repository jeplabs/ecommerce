import type { FormaPago } from '@/entities/order';
import type { ShippingOptionsApi, ShippingServiceApi } from './schemas/api';
import type { ShippingOptionsView, ShippingServiceCosts, ShippingServiceView } from './types';

const EMPTY_SHIPPING_COSTS: ShippingServiceCosts = {
    tarifa: 0,
    enLinea: 0,
    contraEntrega: 0,
};

export function isPickupService(
    servicio: Pick<ShippingServiceApi, 'nombre'> | null | undefined
): boolean {
    if (!servicio?.nombre) return false;
    return servicio.nombre.toLowerCase().includes('retiro');
}

export function isExpressService(
    servicio: Pick<ShippingServiceApi, 'nombre'> | null | undefined
): boolean {
    if (!servicio?.nombre) return false;
    const nombre = servicio.nombre.toLowerCase();
    return nombre.includes('express') || nombre.includes('expres');
}

/** Retiro y envío normal pueden quedar gratis; express siempre se cobra. */
export function qualifiesForFreeShipping(
    opciones: Pick<ShippingOptionsApi, 'envioGratis'>,
    servicio: ShippingServiceApi | null | undefined
): boolean {
    if (!servicio || !opciones.envioGratis) return false;
    if (isExpressService(servicio)) return false;
    return !isPickupService(servicio);
}

const SERVICE_SORT_ORDER = {
    pickup: 0,
    normal: 1,
    express: 2,
} as const;

function getServiceKind(servicio: ShippingServiceApi) {
    if (isPickupService(servicio)) return SERVICE_SORT_ORDER.pickup;
    if (isExpressService(servicio)) return SERVICE_SORT_ORDER.express;
    return SERVICE_SORT_ORDER.normal;
}

/** Retiro → envío normal → express (una fila en el checkout). */
export function sortShippingServices(servicios: ShippingServiceApi[]): ShippingServiceApi[] {
    return [...servicios].sort(
        (a, b) => getServiceKind(a) - getServiceKind(b) || a.nombre.localeCompare(b.nombre)
    );
}

/** Una tarjeta por tipo: retiro, envío normal y express (máx. 3 columnas). */
export function getCheckoutShippingOptions(
    servicios: ShippingServiceApi[]
): ShippingServiceApi[] {
    const sorted = sortShippingServices(servicios);
    const pickup = sorted.find(isPickupService);
    const express = sorted.find(isExpressService);
    const normal = sorted.find((s) => !isPickupService(s) && !isExpressService(s));

    return [pickup, normal, express].filter((s): s is ShippingServiceApi => s != null);
}

const EXPRESS_CUTOFF_HOUR = 16;

export function getExpressDeliveryHint(now: Date = new Date()): string {
    if (now.getHours() >= EXPRESS_CUTOFF_HOUR) {
        return 'Entrega al día hábil siguiente (compras después de las 16:00).';
    }
    return 'Entrega el mismo día hábil si compras antes de las 16:00.';
}

export function getShippingServiceDescription(servicio: ShippingServiceApi): string | null {
    if (isExpressService(servicio)) return getExpressDeliveryHint();
    if (isPickupService(servicio)) {
        return servicio.descripcion ?? 'Recoge tu pedido en nuestra tienda.';
    }
    return servicio.descripcion ?? 'Entrega en 2 a 5 días hábiles.';
}

export function getShippingServiceCosts(
    servicio: ShippingServiceApi | null | undefined
): ShippingServiceCosts {
    if (!servicio) return EMPTY_SHIPPING_COSTS;
    return {
        tarifa: servicio.tarifa,
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
    if (!servicio) return 0;

    const { enLinea, contraEntrega } = getShippingServiceCosts(servicio);
    const baseCost = formaPago === 'CONTRA_ENTREGA' ? contraEntrega : enLinea;

    if (qualifiesForFreeShipping(opciones, servicio)) {
        return 0;
    }

    return baseCost;
}

export function resolveShippingCostInTotal(
    opciones: Pick<ShippingOptionsApi, 'envioGratis'>,
    servicio: ShippingServiceApi | null | undefined,
    formaPagoEnvio: FormaPago
): number {
    if (!servicio) return 0;
    return resolveShippingCost(opciones, servicio, formaPagoEnvio);
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
