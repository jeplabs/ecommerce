import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CheckoutView } from './CheckoutView';

vi.mock('../CheckoutContent/CheckoutContent', () => ({
    default: () => <div data-testid="checkout-content">Checkout Content Component</div>,
}));

vi.mock('@/app/providers', () => ({
    CheckoutProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="checkout-provider">{children}</div>
    ),
}));

describe('CheckoutView (BPR)', () => {
    it('renderiza CheckoutProvider y CheckoutContent dentro del contenedor', () => {
        render(<CheckoutView />);

        expect(screen.getByTestId('checkout-provider')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-content')).toBeInTheDocument();
    });
});
