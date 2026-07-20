import { describe, expect, it } from 'vitest';
import type { ShippingServiceApi } from './schemas/api';
import { resolveShippingCost } from './mappers';

const normalService: ShippingServiceApi = {
    id: 2,
    nombre: 'Envío estándar',
    descripcion: 'Entrega en 3 a 5 días',
    servicioExpress: false,
    tarifa: 10,
    recargoContraEntrega: 0,
    costoEnLinea: 10,
    costoContraEntrega: 10,
    logoUrl: null,
};

const expressService: ShippingServiceApi = {
    id: 3,
    nombre: 'Envío express',
    descripcion: 'Entrega en 24 horas',
    servicioExpress: true,
    tarifa: 55,
    recargoContraEntrega: 0,
    costoEnLinea: 55,
    costoContraEntrega: 55,
    logoUrl: null,
};

describe('resolveShippingCost', () => {
    it('contraentrega siempre retorna 0 (el comercio no cobra envío)', () => {
        const result = resolveShippingCost(
            { envioGratis: false },
            normalService,
            'CONTRA_ENTREGA'
        );

        expect(result).toBe(0);
    });

    it('contraentrega con express también retorna 0', () => {
        const result = resolveShippingCost(
            { envioGratis: false },
            expressService,
            'CONTRA_ENTREGA'
        );

        expect(result).toBe(0);
    });

    it('aplica envío gratis en línea cuando el subtotal alcanza el mínimo', () => {
        const result = resolveShippingCost(
            { envioGratis: true },
            normalService,
            'EN_LINEA'
        );

        expect(result).toBe(0);
    });

    it('cobra envío normal en línea si no alcanza el mínimo', () => {
        const result = resolveShippingCost(
            { envioGratis: false },
            normalService,
            'EN_LINEA'
        );

        expect(result).toBe(10);
    });

    it('no deja gratis el express aunque haya envío gratis global', () => {
        const result = resolveShippingCost(
            { envioGratis: true },
            expressService,
            'EN_LINEA'
        );

        expect(result).toBe(55);
    });

    it('mantiene el costo base para envío express en línea', () => {
        const result = resolveShippingCost({ envioGratis: true }, expressService, 'EN_LINEA');

        expect(result).toBe(55);
    });
});
