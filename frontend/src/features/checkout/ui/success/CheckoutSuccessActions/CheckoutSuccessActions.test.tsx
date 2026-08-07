import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import CheckoutSuccessActions from './CheckoutSuccessActions';

function renderWithRouter() {
    return render(
        <MemoryRouter>
            <CheckoutSuccessActions />
        </MemoryRouter>
    );
}

describe('CheckoutSuccessActions', () => {
    it('muestra las acciones y navega a cada ruta', () => {
        renderWithRouter();

        expect(
            screen.getByRole('navigation', { name: 'Acciones tras la compra' })
        ).toBeInTheDocument();

        const historial = screen.getByRole('link', { name: 'Ver historial de compras' });
        const seguir = screen.getByRole('link', { name: 'Seguir comprando' });
        const inicio = screen.getByRole('link', { name: 'Volver al inicio' });

        expect(historial).toHaveAttribute('href', '/profile/ordenes');
        expect(seguir).toHaveAttribute('href', '/catalogo');
        expect(inicio).toHaveAttribute('href', '/');
    });
});
