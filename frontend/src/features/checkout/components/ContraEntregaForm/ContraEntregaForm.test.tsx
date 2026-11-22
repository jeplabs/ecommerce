import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/providers/useCheckout', () => ({
    useCheckout: vi.fn(),
}));

import { useCheckout } from '@/app/providers/useCheckout';
import ContraEntregaForm from './ContraEntregaForm';
import { makeCheckoutMock } from '@/test/checkoutMock';

const useCheckoutMock = vi.mocked(useCheckout);

describe('ContraEntregaForm', () => {
    it('muestra las características del pago contra entrega', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ selectedServicio: { nombre: 'Envío estándar' } }) as never
        );
        render(<ContraEntregaForm />);

        expect(screen.getByText('Contra entrega')).toBeInTheDocument();
        expect(screen.getByText('Pago al recibir')).toBeInTheDocument();
        expect(screen.getByText(/Envío estándar/)).toBeInTheDocument();
        expect(screen.getByText(/se cobrará al momento de recibir el pedido/i)).toBeInTheDocument();
    });

    it('funciona sin servicio seleccionado', () => {
        useCheckoutMock.mockReturnValue(makeCheckoutMock({ selectedServicio: null }) as never);
        render(<ContraEntregaForm />);

        expect(screen.getByText('Contra entrega')).toBeInTheDocument();
    });
});
