import { PAYMENT_METHODS } from '../services/paymentService';

export const FORMA_PAGO_ENVIO = {
    EN_LINEA: 'EN_LINEA',
    CONTRA_ENTREGA: 'CONTRA_ENTREGA',
};

/** Detecta retiro en tienda por nombre del servicio (registro en `servicios_envio`). */
export function isPickupService(servicio) {
    if (!servicio?.nombre) return false;
    return servicio.nombre.toLowerCase().includes('retiro');
}

export function paymentMethodToFormaPago(paymentMethod) {
    return paymentMethod === PAYMENT_METHODS.WEBPAY ||
        paymentMethod === PAYMENT_METHODS.STRIPE
        ? FORMA_PAGO_ENVIO.EN_LINEA
        : FORMA_PAGO_ENVIO.CONTRA_ENTREGA;
}

/** Tarifa base, recargo y totales por forma de pago del envío. */
export function getServicioCostos(servicio) {
    if (!servicio) {
        return { tarifa: 0, recargo: 0, enLinea: 0, contraEntrega: 0 };
    }

    const tarifa = Number(servicio.tarifa ?? servicio.costoEnLinea ?? 0);
    const recargo = Number(servicio.recargoContraEntrega ?? 0);
    const enLinea = Number(servicio.costoEnLinea ?? tarifa);
    const contraEntrega = Number(
        servicio.costoContraEntrega ?? tarifa + recargo
    );

    return { tarifa, recargo, enLinea, contraEntrega };
}

/**
 * Costo de envío según servicio y forma de pago del envío (valor real del courier).
 */
export function resolveShippingCost({ opciones, servicio, formaPago = FORMA_PAGO_ENVIO.EN_LINEA }) {
    if (!servicio) return 0;
    if (opciones?.envioGratis) return 0;

    const { enLinea, contraEntrega } = getServicioCostos(servicio);
    return formaPago === FORMA_PAGO_ENVIO.CONTRA_ENTREGA ? contraEntrega : enLinea;
}

/**
 * Monto del envío que se suma al total a pagar ahora en checkout.
 */
export function resolveShippingCostInTotal({ opciones, servicio, formaPagoEnvio }) {
    if (!servicio || opciones?.envioGratis) return 0;
    if (formaPagoEnvio === FORMA_PAGO_ENVIO.CONTRA_ENTREGA) return 0;
    return resolveShippingCost({
        opciones,
        servicio,
        formaPago: FORMA_PAGO_ENVIO.EN_LINEA,
    });
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
