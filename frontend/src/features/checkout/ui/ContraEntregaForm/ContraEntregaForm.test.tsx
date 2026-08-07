import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/providers', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/app/providers')>();
    return {
        ...mod,
        useCheckout: vi.fn(),
    };
});

import { useCheckout } from '@/app/providers';
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
        expect(screen.getByText('Pago pendiente')).toBeInTheDocument();
        expect(screen.getByText(/Envío estándar/)).toBeInTheDocument();
        expect(screen.getByText(/se cobrara al momento de recibir el pedido/)).toBeInTheDocument();
    });

    it('funciona sin servicio seleccionado', () => {
        useCheckoutMock.mockReturnValue(makeCheckoutMock({ selectedServicio: null }) as never);
        render(<ContraEntregaForm />);

        expect(screen.getByText('Contra entrega')).toBeInTheDocument();
    });
});
