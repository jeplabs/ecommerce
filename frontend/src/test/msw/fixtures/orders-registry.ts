import type { OrderApi } from '@/entities/order/model/schemas/api';
import type { SpringPage } from '@/shared/api/spring-page';
import { mockAddresses } from './addresses';
import { mockProduct } from './products';

export const MOCK_ORDER_PENDING_ID = 501;
export const MOCK_ORDER_TRANSFER_ID = 502;
export const MOCK_ORDER_SHIPPED_ID = 503;

let orders: OrderApi[] = [];

function buildSampleOrder(
    id: number,
    estado: OrderApi['estado'],
    creadoAt = '2026-05-20T10:00:00'
): OrderApi {
    const address = mockAddresses[0]!;
    const subtotal = mockProduct.precioVenta;
    const iva = Math.round(subtotal * 0.19 * 100) / 100;
    const costoEnvio = 5.99;
    const total = subtotal + iva + costoEnvio;

    return {
        id,
        estado,
        direccionId: address.id,
        direccionEnvio: {
            alias: address.alias,
            calle: address.direccion,
            ciudad: address.ciudad,
            estado: address.estado,
            codigoPostal: address.codigoPostal ?? null,
            pais: address.pais,
            telefono: address.telefono,
            referencias: address.referencias ?? null,
        },
        servicioEnvio: 'Envío estándar',
        formaPago: 'EN_LINEA',
        items: [
            {
                id: 1,
                productoId: mockProduct.id,
                sku: mockProduct.sku,
                nombreProducto: mockProduct.nombre,
                cantidad: 1,
                precioUnitario: mockProduct.precioVenta,
                precioBase: mockProduct.precioVenta,
                ivaUnitario: 0,
                subtotal: mockProduct.precioVenta,
            },
        ],
        subtotal,
        iva,
        costoEnvio,
        total,
        notas: null,
        creadoAt,
        actualizadoAt: creadoAt,
    };
}

export function resetDynamicOrders() {
    orders = [
        buildSampleOrder(MOCK_ORDER_PENDING_ID, 'PENDIENTE'),
        buildSampleOrder(MOCK_ORDER_TRANSFER_ID, 'PENDIENTE', '2026-05-22T14:30:00'),
        buildSampleOrder(MOCK_ORDER_SHIPPED_ID, 'ENVIADA', '2026-05-10T09:15:00'),
    ];
}

export function getDynamicOrders(): OrderApi[] {
    return orders.map((order) => ({ ...order }));
}

export function findDynamicOrder(id: number): OrderApi | undefined {
    const order = orders.find((entry) => entry.id === id);
    return order ? { ...order } : undefined;
}

export function addDynamicOrder(order: OrderApi) {
    orders = [order, ...orders.filter((entry) => entry.id !== order.id)];
}

export function cancelDynamicOrder(id: number): OrderApi {
    const index = orders.findIndex((order) => order.id === id);
    if (index === -1) {
        throw new Error('Orden no encontrada');
    }

    const order = orders[index]!;
    if (order.estado !== 'PENDIENTE' && order.estado !== 'CONFIRMADA') {
        throw new Error('La orden no puede cancelarse');
    }

    const cancelled = {
        ...order,
        estado: 'CANCELADA' as const,
        actualizadoAt: '2026-05-28T15:00:00',
    };
    orders[index] = cancelled;
    return { ...cancelled };
}

export function getDynamicOrdersPage(page = 0, size = 10): SpringPage<OrderApi> {
    const start = page * size;
    const content = orders.slice(start, start + size);

    return {
        content,
        totalElements: orders.length,
        totalPages: orders.length === 0 ? 0 : 1,
        size,
        number: page,
        first: page === 0,
        last: page >= Math.max(orders.length - 1, 0),
        empty: content.length === 0,
        numberOfElements: content.length,
    };
}
