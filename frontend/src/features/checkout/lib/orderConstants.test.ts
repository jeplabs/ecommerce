import { describe, expect, it } from 'vitest';
import {
    ADMIN_ESTADOS_SIGUIENTES,
    FORMA_PAGO_ENVIO,
    ORDEN_ESTADOS_FILTRO,
    getOpcionesEstadoAdmin,
} from './orderConstants';

describe('orderConstants', () => {
    it('expone valores esperados de FORMA_PAGO_ENVIO y filtro de órdenes', () => {
        expect(FORMA_PAGO_ENVIO).toEqual({
            EN_LINEA: 'EN_LINEA',
            CONTRA_ENTREGA: 'CONTRA_ENTREGA',
        });
        expect(ORDEN_ESTADOS_FILTRO[0]).toEqual({ value: '', label: 'Todos los estados' });
        expect(ORDEN_ESTADOS_FILTRO).toHaveLength(7);
    });

    it('getOpcionesEstadoAdmin incluye el estado actual seguido de las transiciones permitidas', () => {
        expect(getOpcionesEstadoAdmin('PENDIENTE')).toEqual(['PENDIENTE', 'CONFIRMADA', 'CANCELADA']);
        expect(getOpcionesEstadoAdmin('CONFIRMADA')).toEqual(['CONFIRMADA', 'EN_PROCESO', 'CANCELADA']);
        expect(getOpcionesEstadoAdmin('EN_PROCESO')).toEqual(['EN_PROCESO', 'ENVIADA']);
        expect(getOpcionesEstadoAdmin('ENVIADA')).toEqual(['ENVIADA', 'ENTREGADA']);
    });

    it('getOpcionesEstadoAdmin solo retorna el estado actual para estados terminales o desconocidos', () => {
        expect(getOpcionesEstadoAdmin('ENTREGADA')).toEqual(['ENTREGADA']);
        expect(getOpcionesEstadoAdmin('CANCELADA')).toEqual(['CANCELADA']);
        expect(ADMIN_ESTADOS_SIGUIENTES.ENTREGADA).toEqual([]);
        expect(getOpcionesEstadoAdmin('OTRO' as never)).toEqual(['OTRO']);
    });
});
