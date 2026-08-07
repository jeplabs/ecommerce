import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/providers', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/app/providers')>();
    return {
        ...mod,
        useCheckout: vi.fn(),
    };
});

import { useCheckout } from '@/app/providers';
import ReviewAndShippingStep from './ReviewAndShippingStep';
import { makeCheckoutMock } from '@/test/checkoutMock';

const useCheckoutMock = vi.mocked(useCheckout);

describe('ReviewAndShippingStep', () => {
    it('muestra el selector de sucursal cuando hay retiro seleccionado', () => {
        useCheckoutMock.mockReturnValue(makeCheckoutMock({ isPickupSelected: true }) as never);
        render(
            <MemoryRouter>
                <ReviewAndShippingStep />
            </MemoryRouter>
        );

        expect(screen.getByText('Sucursal de retiro')).toBeInTheDocument();
        expect(screen.queryByText('Dirección de entrega')).not.toBeInTheDocument();
    });

    it('muestra el selector de dirección cuando hay envío normal', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ isPickupSelected: false, selectedServicioEnvioId: 2 }) as never
        );
        render(
            <MemoryRouter>
                <ReviewAndShippingStep />
            </MemoryRouter>
        );

        expect(screen.getByText('Dirección de entrega')).toBeInTheDocument();
        expect(screen.queryByText('Sucursal de retiro')).not.toBeInTheDocument();
    });

    it('no muestra selectores sin servicio seleccionado', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ isPickupSelected: false, selectedServicioEnvioId: null }) as never
        );
        render(
            <MemoryRouter>
                <ReviewAndShippingStep />
            </MemoryRouter>
        );

        expect(screen.queryByText('Dirección de entrega')).not.toBeInTheDocument();
        expect(screen.queryByText('Sucursal de retiro')).not.toBeInTheDocument();
    });
});
