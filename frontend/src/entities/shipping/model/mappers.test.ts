import { describe, expect, it } from 'vitest';
import type { ShippingServiceApi } from './schemas/api';
import { resolveShippingCost } from './mappers';

const normalService: ShippingServiceApi = {
    id: 2,
    nombre: 'Envío estándar',
    descripcion: 'Entrega en 3 a 5 días',
    tarifa: 10,
    recargoContraEntrega: 3,
    costoEnLinea: 10,
    costoContraEntrega: 13,
    logoUrl: null,
};

const expressService: ShippingServiceApi = {
    id: 3,
    nombre: 'Envío express',
    descripcion: 'Entrega en 24 horas',
    tarifa: 55,
    recargoContraEntrega: 15,
    costoEnLinea: 55,
    costoContraEntrega: 70,
    logoUrl: null,
};

describe('resolveShippingCost', () => {
    it('no aplica envío gratis para contraentrega', () => {
        const result = resolveShippingCost(
            { envioGratis: true },
            normalService,
            'CONTRA_ENTREGA'
        );

        expect(result).toBe(13);
    });

    it('no deja gratis el express aunque haya envío gratis global', () => {
        const result = resolveShippingCost(
            { envioGratis: true },
            expressService,
            'CONTRA_ENTREGA'
        );

        expect(result).toBe(70);
    });

    it('mantiene el costo base para envío express en línea', () => {
        const result = resolveShippingCost({ envioGratis: true }, expressService, 'EN_LINEA');

        expect(result).toBe(55);
    });
});
