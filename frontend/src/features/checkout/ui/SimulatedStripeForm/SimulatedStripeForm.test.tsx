import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/providers', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/app/providers')>();
    return {
        ...mod,
        useCheckout: vi.fn(),
    };
});

import { useCheckout } from '@/app/providers';
import SimulatedStripeForm from './SimulatedStripeForm';
import { makeCheckoutMock } from '@/test/checkoutMock';

const useCheckoutMock = vi.mocked(useCheckout);

describe('SimulatedStripeForm', () => {
    it('muestra el hint y los campos de tarjeta', () => {
        useCheckoutMock.mockReturnValue(makeCheckoutMock({}) as never);
        render(<SimulatedStripeForm />);

        expect(screen.getByText('Stripe')).toBeInTheDocument();
        expect(screen.getByText(/Tarjeta de prueba/)).toBeInTheDocument();
        expect(screen.getByLabelText('Titular de la tarjeta')).toBeInTheDocument();
        expect(screen.getByLabelText('Número de tarjeta')).toBeInTheDocument();
        expect(screen.getByLabelText('Expiración')).toBeInTheDocument();
        expect(screen.getByLabelText('CVC')).toBeInTheDocument();
    });

    it('formatea el número de tarjeta al escribir', () => {
        const updateCardField = vi.fn();
        useCheckoutMock.mockReturnValue(makeCheckoutMock({ updateCardField }) as never);
        render(<SimulatedStripeForm />);

        fireEvent.change(screen.getByLabelText('Número de tarjeta'), {
            target: { value: '4242424242424242' },
        });

        expect(updateCardField).toHaveBeenLastCalledWith(
            'cardNumber',
            '4242 4242 4242 4242'
        );
    });

    it('formatea la expiración y el CVC', () => {
        const updateCardField = vi.fn();
        useCheckoutMock.mockReturnValue(makeCheckoutMock({ updateCardField }) as never);
        render(<SimulatedStripeForm />);

        fireEvent.change(screen.getByLabelText('Expiración'), {
            target: { value: '1230' },
        });
        expect(updateCardField).toHaveBeenLastCalledWith('expiry', '12/30');

        fireEvent.change(screen.getByLabelText('Expiración'), {
            target: { value: '12' },
        });
        expect(updateCardField).toHaveBeenLastCalledWith('expiry', '12');

        fireEvent.change(screen.getByLabelText('CVC'), {
            target: { value: '1234' },
        });
        expect(updateCardField).toHaveBeenLastCalledWith('cvc', '1234');
    });

    it('escribe el titular de la tarjeta', () => {
        const updateCardField = vi.fn();
        useCheckoutMock.mockReturnValue(makeCheckoutMock({ updateCardField }) as never);
        render(<SimulatedStripeForm />);

        fireEvent.change(screen.getByLabelText('Titular de la tarjeta'), {
            target: { value: 'Ana López' },
        });
        expect(updateCardField).toHaveBeenLastCalledWith('cardholder', 'Ana López');
    });
});
