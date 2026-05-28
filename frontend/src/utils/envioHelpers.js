import { PAYMENT_METHODS } from '../services/paymentService';

/** Detecta retiro en tienda por nombre del servicio (registro en `servicios_envio`). */
export function isPickupService(servicio) {
    if (!servicio?.nombre) return false;
    return servicio.nombre.toLowerCase().includes('retiro');
}

export function paymentMethodToFormaPago(paymentMethod) {
    return paymentMethod === PAYMENT_METHODS.WEBPAY ||
        paymentMethod === PAYMENT_METHODS.STRIPE
        ? 'EN_LINEA'
        : 'CONTRA_ENTREGA';
}

/**
 * Costo de envío a mostrar / sumar al total según opciones del backend y forma de pago.
 */
export function resolveShippingCost({ opciones, servicio, formaPago = 'EN_LINEA' }) {
    if (!servicio) return 0;
    if (opciones?.envioGratis) return 0;

    const enLinea = Number(servicio.costoEnLinea ?? servicio.tarifa ?? 0);
    const contraEntrega = Number(
        servicio.costoContraEntrega ??
            (Number(servicio.tarifa ?? 0) + Number(servicio.recargoContraEntrega ?? 0))
    );

    return formaPago === 'CONTRA_ENTREGA' ? contraEntrega : enLinea;
}

/** Separa retiro en tienda del resto de couriers para la UI. */
export function partitionShippingServices(servicios = []) {
    const pickup = [];
    const delivery = [];
    for (const s of servicios) {
        if (isPickupService(s)) {
            pickup.push(s);
        } else {
            delivery.push(s);
        }
    }
    return { pickup, delivery };
}
