import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CheckoutPageHeader } from './CheckoutPageHeader';

describe('CheckoutPageHeader', () => {
    it('renderiza título por defecto y enlace al carrito', () => {
        render(
            <MemoryRouter>
                <CheckoutPageHeader />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { level: 1, name: 'Checkout' })).toBeInTheDocument();
        const link = screen.getByRole('link', { name: '← Volver al carrito' });
        expect(link).toHaveAttribute('href', '/cart');
    });

    it('permite personalizar el enlace de retorno y el título', () => {
        render(
            <MemoryRouter>
                <CheckoutPageHeader backTo="/checkout" backLabel="← Volver al checkout" title="Retorno" />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { level: 1, name: 'Retorno' })).toBeInTheDocument();
        const link = screen.getByRole('link', { name: '← Volver al checkout' });
        expect(link).toHaveAttribute('href', '/checkout');
    });
});
