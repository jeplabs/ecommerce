import type { CartApi } from '@/entities/cart/model/schemas/api';
import type { OrderApi } from '@/entities/order/model/schemas/api';
import type { SpringPage } from '@/shared/api/spring-page';
import { mockAddresses } from './addresses';
import { mockBranches } from './branches';
import { findMockShippingService } from './shipping';

let nextOrderId = 1001;

export function resetMockOrderIds() {
    nextOrderId = 1001;
}

export function mockOrdersPage(content: OrderApi[] = []): SpringPage<OrderApi> {
    return {
        content,
        totalElements: content.length,
        totalPages: content.length === 0 ? 0 : 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: content.length === 0,
        numberOfElements: content.length,
    };
}

type CreateMockOrderParams = {
    direccionId?: number | null;
    sucursalId?: number | null;
    servicioEnvioId: number;
    cart: CartApi;
    notas?: string | null;
    formaPagoEnvio?: OrderApi['formaPagoEnvio'];
    metodoPago?: OrderApi['metodoPago'];
};

export function mockCreatedOrder({
    direccionId,
    sucursalId,
    servicioEnvioId,
    cart,
    notas = null,
    formaPagoEnvio = 'EN_LINEA',
    metodoPago = 'STRIPE',
}: CreateMockOrderParams): OrderApi {
    const branch = sucursalId ? mockBranches.find((b) => b.id === sucursalId) ?? mockBranches[0] : null;
    const address = !branch ? mockAddresses.find((entry) => entry.id === direccionId) ?? mockAddresses[0] : null;
    const servicio = findMockShippingService(servicioEnvioId) ?? findMockShippingService(2)!;
    const subtotal = cart.total;
    const iva = Math.round(subtotal * 0.19 * 100) / 100;
    const costoEnvio = servicio.costoEnLinea;
    const total = subtotal + iva + costoEnvio;
    const now = '2026-05-28T12:00:00';

    const direccionEnvio = branch
        ? {
              alias: branch.nombre,
              calle: branch.direccion,
              ciudad: branch.ciudad,
              estado: branch.estado ?? 'Guatemala',
              codigoPostal: branch.codigoPostal ?? null,
              pais: branch.pais,
              telefono: branch.telefono,
              referencias: branch.referencias ?? null,
              horario: branch.horario,
          }
        : address
        ? {
              alias: address.alias,
              calle: address.direccion,
              ciudad: address.ciudad,
              estado: address.estado,
              codigoPostal: address.codigoPostal ?? null,
              pais: address.pais,
              telefono: address.telefono,
              referencias: address.referencias ?? null,
          }
        : null;

    return {
        id: nextOrderId++,
        estado: 'PENDIENTE',
        direccionId: address?.id ?? null,
        sucursalId: branch?.id ?? null,
        direccionEnvio,
        servicioEnvio: servicio.nombre,
        formaPagoEnvio,
        metodoPago,
        items: cart.items.map((item, index) => ({
            id: index + 1,
            productoId: item.productoId,
            sku: item.skuProducto,
            nombreProducto: item.nombreProducto,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            precioBase: item.precioUnitario,
            ivaUnitario: 0,
            subtotal: item.subtotal,
        })),
        subtotal,
        iva,
        costoEnvio,
        total,
        notas,
        creadoAt: now,
        actualizadoAt: now,
    };
}
