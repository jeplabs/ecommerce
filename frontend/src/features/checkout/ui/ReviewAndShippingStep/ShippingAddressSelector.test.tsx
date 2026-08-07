import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import ShippingAddressSelector from './ShippingAddressSelector';
import { makeCheckoutMock } from '@/test/checkoutMock';
import { mockAddresses } from '@/test/msw/fixtures/addresses';

const useCheckoutMock = vi.mocked(useCheckout);

function renderAddressSelector() {
    return render(
        <MemoryRouter>
            <ShippingAddressSelector />
        </MemoryRouter>
    );
}

describe('ShippingAddressSelector', () => {
    it('muestra el estado de carga', () => {
        useCheckoutMock.mockReturnValue(makeCheckoutMock({ loadingAddresses: true }) as never);
        renderAddressSelector();

        expect(screen.getByText('Cargando direcciones…')).toBeInTheDocument();
    });

    it('muestra mensaje y enlace cuando no hay direcciones', () => {
        useCheckoutMock.mockReturnValue(makeCheckoutMock({ direcciones: [] }) as never);
        renderAddressSelector();

        expect(screen.getByText('No tienes direcciones guardadas.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ir a mis direcciones' })).toHaveAttribute(
            'href',
            '/profile/direcciones'
        );
    });

    it('lista las direcciones y selecciona una', () => {
        const setSelectedAddressId = vi.fn();
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ setSelectedAddressId }) as never
        );
        renderAddressSelector();

        expect(screen.getByText('Dirección de entrega')).toBeInTheDocument();
        expect(screen.getByText('Casa')).toBeInTheDocument();
        expect(screen.getByText('Principal')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('radio', { name: /Oficina/ }));
        expect(setSelectedAddressId).toHaveBeenCalledWith(2);
    });

    it('escribe notas del pedido', async () => {
        const user = userEvent.setup();
        const setNotas = vi.fn();
        useCheckoutMock.mockReturnValue(makeCheckoutMock({ setNotas }) as never);
        renderAddressSelector();

        const textarea = screen.getByLabelText(/Notas para el pedido/);
        await user.type(textarea, 'Dejar en recepción');

        expect(setNotas).toHaveBeenCalledWith('D');
    });

    it('muestra el enlace para gestionar direcciones', () => {
        useCheckoutMock.mockReturnValue(makeCheckoutMock({}) as never);
        renderAddressSelector();

        expect(screen.getByRole('link', { name: 'Gestionar direcciones en mi perfil' })).toHaveAttribute(
            'href',
            '/profile/direcciones'
        );
    });

    it('omite el badge Principal para direcciones no principales', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ selectedAddressId: mockAddresses[1]?.id }) as never
        );
        renderAddressSelector();

        expect(screen.getAllByText('Principal')).toHaveLength(1);
    });
});
