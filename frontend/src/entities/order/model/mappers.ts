import type { OrderApi } from './schemas/api';
import type { OrderSummaryCardView } from './types';

export function mapOrderApiToSummaryCard(order: OrderApi): OrderSummaryCardView {
    return {
        id: order.id,
        estado: order.estado,
        total: order.total,
        itemsCount: order.items.reduce((acc, item) => acc + item.cantidad, 0),
        creadoAt: order.creadoAt,
        servicioEnvio: order.servicioEnvio ?? null,
    };
}

export const ORDER_STATUS_LABELS: Record<OrderApi['estado'], string> = {
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    EN_PROCESO: 'En proceso',
    ENVIADA: 'Enviada',
    ENTREGADA: 'Entregada',
    CANCELADA: 'Cancelada',
};

export const FORMA_PAGO_LABELS: Record<OrderApi['formaPagoEnvio'], string> = {
    EN_LINEA: 'Envío pagado en línea',
    CONTRA_ENTREGA: 'Envío contra entrega',
};

export function formatOrderStatus(estado: OrderApi['estado']): string {
    return ORDER_STATUS_LABELS[estado] ?? estado;
}

export function formatFormaPago(formaPago: OrderApi['formaPagoEnvio']): string {
    return FORMA_PAGO_LABELS[formaPago] ?? formaPago;
}

/** Alias semántico para UI de checkout y detalle de orden. */
export const formatFormaPagoEnvio = formatFormaPago;

export function isPickupFromServicioNombre(nombre: string | null | undefined): boolean {
    if (!nombre) return false;
    return nombre.toLowerCase().includes('retiro');
}

export function getContraEntregaShippingNote(servicioEnvio: string): string {
    return `El envío se paga de manera adicional al valor de la compra al recibir el producto. El valor del envío lo puedes consultar directamente con ${servicioEnvio}.`;
}
