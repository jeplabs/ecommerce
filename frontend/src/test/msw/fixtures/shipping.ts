import type { ShippingOptionsApi, ShippingServiceApi } from '@/entities/shipping/model/schemas/api';

export const mockShippingServices: ShippingServiceApi[] = [
    {
        id: 1,
        nombre: 'Retiro en tienda',
        descripcion: 'Retira gratis en nuestra sucursal',
        tarifa: 0,
        recargoContraEntrega: 0,
        costoEnLinea: 0,
        costoContraEntrega: 0,
        logoUrl: null,
    },
    {
        id: 2,
        nombre: 'Envío estándar',
        descripcion: 'Entrega en 3 a 5 días hábiles',
        tarifa: 5.99,
        recargoContraEntrega: 0,
        costoEnLinea: 5.99,
        costoContraEntrega: 5.99,
        logoUrl: null,
    },
    {
        id: 3,
        nombre: 'Envío express',
        descripcion: 'Entrega en 24 horas',
        tarifa: 9.99,
        recargoContraEntrega: 0,
        costoEnLinea: 9.99,
        costoContraEntrega: 9.99,
        logoUrl: null,
    },
];

export function mockShippingOptions(subtotal = 0): ShippingOptionsApi {
    const normalized = Math.max(0, Number(subtotal) || 0);

    return {
        envioGratis: normalized >= 150,
        costoEnvio: null,
        montoMinimoGratis: 150,
        servicios: mockShippingServices,
    };
}

export function findMockShippingService(id: number): ShippingServiceApi | undefined {
    return mockShippingServices.find((service) => service.id === id);
}
