import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CheckoutReturnView } from './CheckoutReturnView';

vi.mock('../CheckoutReturn/CheckoutReturn', () => ({
    default: () => <div data-testid="checkout-return">Checkout Return Component</div>,
}));

describe('CheckoutReturnView', () => {
    it('renderiza el header de retorno y el componente CheckoutReturn', () => {
        render(
            <MemoryRouter>
                <CheckoutReturnView />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { level: 1, name: 'Retorno Webpay' })).toBeInTheDocument();
        expect(screen.getByTestId('checkout-return')).toBeInTheDocument();
    });
});
