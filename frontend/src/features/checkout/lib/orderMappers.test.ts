import { describe, expect, it } from 'vitest';
import {
    formatFormaPago,
    formatFormaPagoEnvio,
    formatOrderStatus,
    getContraEntregaShippingNote,
    isPickupFromServicioNombre,
    mapOrderApiToSummaryCard,
} from './orderMappers';
import { findDynamicOrder, MOCK_ORDER_PENDING_ID } from '@/test/msw/fixtures/orders-registry';

describe('orderMappers', () => {
    it('mapOrderApiToSummaryCard resume itemsCount, estado, servicio y total', () => {
        const base = findDynamicOrder(MOCK_ORDER_PENDING_ID)!;
        const order = {
            ...base,
            id: 700,
            estado: 'CONFIRMADA' as const,
            total: 450,
            servicioEnvio: 'Envío estándar',
            creadoAt: '2026-11-01T12:00:00Z',
            items: [
                { ...base.items[0]!, cantidad: 2 },
                { ...base.items[0]!, id: 99, cantidad: 3 },
            ],
        };

        expect(mapOrderApiToSummaryCard(order)).toEqual({
            id: 700,
            estado: 'CONFIRMADA',
            total: 450,
            itemsCount: 5,
            creadoAt: '2026-11-01T12:00:00Z',
            servicioEnvio: 'Envío estándar',
        });
    });

    it('mapOrderApiToSummaryCard normaliza servicioEnvio ausente a null', () => {
        const base = findDynamicOrder(MOCK_ORDER_PENDING_ID)!;
        const card = mapOrderApiToSummaryCard({ ...base, servicioEnvio: undefined });

        expect(card.servicioEnvio).toBeNull();
    });

    it('formatOrderStatus formatea todos los estados conocidos y hace fallback', () => {
        expect(formatOrderStatus('PENDIENTE')).toBe('Pendiente');
        expect(formatOrderStatus('CONFIRMADA')).toBe('Confirmada');
        expect(formatOrderStatus('EN_PROCESO')).toBe('En proceso');
        expect(formatOrderStatus('ENVIADA')).toBe('Enviada');
        expect(formatOrderStatus('ENTREGADA')).toBe('Entregada');
        expect(formatOrderStatus('CANCELADA')).toBe('Cancelada');
        expect(formatOrderStatus('DESCONOCIDO' as never)).toBe('DESCONOCIDO');
    });

    it('formatFormaPago y su alias formatFormaPagoEnvio formatean correctamente', () => {
        expect(formatFormaPago('EN_LINEA')).toBe('Envío pagado en línea');
        expect(formatFormaPago('CONTRA_ENTREGA')).toBe('Envío contra entrega');
        expect(formatFormaPagoEnvio).toBe(formatFormaPago);
        expect(formatFormaPago('OTRO' as never)).toBe('OTRO');
    });

    it('isPickupFromServicioNombre detecta retiro ignorando mayúsculas', () => {
        expect(isPickupFromServicioNombre('Retiro en tienda')).toBe(true);
        expect(isPickupFromServicioNombre('RETIRO SUCURSAL')).toBe(true);
        expect(isPickupFromServicioNombre('Envío estándar')).toBe(false);
        expect(isPickupFromServicioNombre(null)).toBe(false);
        expect(isPickupFromServicioNombre(undefined)).toBe(false);
    });

    it('getContraEntregaShippingNote incluye el nombre del servicio', () => {
        const note = getContraEntregaShippingNote('Cargo Expreso');
        expect(note).toContain('Cargo Expreso');
        expect(note).toContain('al recibir el producto');
    });
});
