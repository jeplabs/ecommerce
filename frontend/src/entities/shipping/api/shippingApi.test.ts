import { describe, expect, it } from 'vitest';
import { shippingApi } from './shippingApi';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { mockShippingServices } from '@/test/msw/fixtures/shipping';

function seedAuth() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
}

describe('shippingApi', () => {
    it('getOpciones devuelve servicios de envío', async () => {
        seedAuth();

        const options = await shippingApi.getOpciones(99.99);

        expect(options.servicios.length).toBe(mockShippingServices.length);
        expect(options.servicios.some((service) => service.nombre.includes('estándar'))).toBe(true);
    });

    it('marca envío gratis cuando el subtotal supera el mínimo', async () => {
        seedAuth();

        const options = await shippingApi.getOpciones(200);

        expect(options.envioGratis).toBe(true);
        expect(options.montoMinimoGratis).toBe(150);
    });
});
