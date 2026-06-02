/**
 * Presentación de datos de envío/pago en órdenes (API: servicioEnvio, costoEnvio, formaPago).
 */

export function isPickupFromServicioNombre(nombre) {
    if (!nombre || typeof nombre !== 'string') return false;
    return nombre.toLowerCase().includes('retiro');
}

const FORMA_PAGO_LABELS = {
    EN_LINEA: 'Pago en línea',
    CONTRA_ENTREGA: 'Contra entrega',
};

const FORMA_PAGO_ENVIO_LABELS = {
    EN_LINEA: 'Envío pagado en línea',
    CONTRA_ENTREGA: 'Envío contra entrega',
};

export function formatFormaPago(formaPago) {
    if (!formaPago) return '—';
    return FORMA_PAGO_LABELS[formaPago] || formaPago;
}

export function formatFormaPagoEnvio(formaPagoEnvio) {
    if (!formaPagoEnvio) return '—';
    return FORMA_PAGO_ENVIO_LABELS[formaPagoEnvio] || formatFormaPago(formaPagoEnvio);
}
