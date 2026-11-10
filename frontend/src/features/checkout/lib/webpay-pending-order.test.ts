import { beforeEach, describe, expect, it } from 'vitest';
import {
    guardarOrdenWebpayPendiente,
    limpiarOrdenWebpayPendiente,
    obtenerOrdenWebpayPendiente,
    parsearOrdenIdDesdeTbk,
} from './webpay-pending-order';

describe('webpay-pending-order', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('guarda, obtiene y limpia el ID de orden pendiente en sessionStorage', () => {
        expect(obtenerOrdenWebpayPendiente()).toBeNull();

        guardarOrdenWebpayPendiente(512);
        expect(obtenerOrdenWebpayPendiente()).toBe(512);

        limpiarOrdenWebpayPendiente();
        expect(obtenerOrdenWebpayPendiente()).toBeNull();
    });

    it('retorna null si el valor almacenado es inválido o no positivo', () => {
        sessionStorage.setItem('webpay:ordenPendienteId', 'abc');
        expect(obtenerOrdenWebpayPendiente()).toBeNull();

        sessionStorage.setItem('webpay:ordenPendienteId', '0');
        expect(obtenerOrdenWebpayPendiente()).toBeNull();

        sessionStorage.setItem('webpay:ordenPendienteId', '-10');
        expect(obtenerOrdenWebpayPendiente()).toBeNull();
    });

    it('parsearOrdenIdDesdeTbk soporta ID numérico directo y formato ORD-{id}', () => {
        expect(parsearOrdenIdDesdeTbk('321')).toBe(321);
        expect(parsearOrdenIdDesdeTbk('ORD-654')).toBe(654);
        expect(parsearOrdenIdDesdeTbk('ORD-654-EXTRA')).toBe(654);
        expect(parsearOrdenIdDesdeTbk(null)).toBeNull();
        expect(parsearOrdenIdDesdeTbk('')).toBeNull();
        expect(parsearOrdenIdDesdeTbk('ORD-abc')).toBeNull();
        expect(parsearOrdenIdDesdeTbk('0')).toBeNull();
        expect(parsearOrdenIdDesdeTbk('INVALID')).toBeNull();
    });
});
