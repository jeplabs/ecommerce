import { beforeEach, describe, expect, it } from 'vitest';
import {
    guardarOrdenQPayProPendiente,
    limpiarOrdenQPayProPendiente,
    obtenerOrdenQPayProPendiente,
} from './qpaypro-pending-order';

describe('qpaypro-pending-order', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('guarda, obtiene y limpia el ID de orden pendiente en sessionStorage', () => {
        expect(obtenerOrdenQPayProPendiente()).toBeNull();

        guardarOrdenQPayProPendiente(808);
        expect(obtenerOrdenQPayProPendiente()).toBe(808);

        limpiarOrdenQPayProPendiente();
        expect(obtenerOrdenQPayProPendiente()).toBeNull();
    });

    it('retorna null cuando el valor guardado no es un ID válido positivo', () => {
        sessionStorage.setItem('qpaypro:ordenPendienteId', 'no-numero');
        expect(obtenerOrdenQPayProPendiente()).toBeNull();

        sessionStorage.setItem('qpaypro:ordenPendienteId', '0');
        expect(obtenerOrdenQPayProPendiente()).toBeNull();

        sessionStorage.setItem('qpaypro:ordenPendienteId', '-3');
        expect(obtenerOrdenQPayProPendiente()).toBeNull();
    });
});
