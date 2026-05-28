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

export function formatFormaPago(formaPago) {
    if (!formaPago) return '—';
    return FORMA_PAGO_LABELS[formaPago] || formaPago;
}
