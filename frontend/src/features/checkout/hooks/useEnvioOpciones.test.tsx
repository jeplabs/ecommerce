import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { shippingApi } from '../api';
import { useEnvioOpciones } from './useEnvioOpciones';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { mockShippingServices } from '@/test/msw/fixtures/shipping';

function seedAuth() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
}

describe('useEnvioOpciones', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('carga las opciones de envío y separa retiro en tienda de domicilio', async () => {
        seedAuth();

        const { result } = renderHook(() => useEnvioOpciones(200));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeNull();
        expect(result.current.opciones.envioGratis).toBe(true);
        expect(result.current.opciones.montoMinimoGratis).toBe(150);
        expect(result.current.servicios).toHaveLength(mockShippingServices.length);
        expect(result.current.pickupServices).toHaveLength(1);
        expect(result.current.pickupServices[0]?.nombre).toBe('Retiro en tienda');
        expect(result.current.deliveryServices).toHaveLength(2);
    });

    it('consulta con formaPagoEnvio actualizada al invocar setFormaPagoEnvio y permite refetch', async () => {
        seedAuth();
        const getOpcionesSpy = vi.spyOn(shippingApi, 'getOpciones');

        const { result } = renderHook(() => useEnvioOpciones(100, 'EN_LINEA'));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(getOpcionesSpy).toHaveBeenCalledWith(100, 'EN_LINEA');

        act(() => {
            result.current.setFormaPagoEnvio('CONTRA_ENTREGA');
        });

        await waitFor(() =>
            expect(getOpcionesSpy).toHaveBeenCalledWith(100, 'CONTRA_ENTREGA')
        );
        expect(result.current.formaPagoEnvio).toBe('CONTRA_ENTREGA');

        await act(async () => {
            await result.current.refetch();
        });

        expect(getOpcionesSpy).toHaveBeenCalledTimes(3);
    });

    it('maneja errores de carga y restablece las opciones vacías', async () => {
        seedAuth();
        vi.spyOn(shippingApi, 'getOpciones').mockRejectedValueOnce(
            new Error('Servicio de envíos caído')
        );

        const { result } = renderHook(() => useEnvioOpciones(100));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Servicio de envíos caído');
        expect(result.current.servicios).toEqual([]);
        expect(result.current.pickupServices).toEqual([]);
        expect(result.current.deliveryServices).toEqual([]);
        expect(result.current.opciones.envioGratis).toBe(false);
    });
});
