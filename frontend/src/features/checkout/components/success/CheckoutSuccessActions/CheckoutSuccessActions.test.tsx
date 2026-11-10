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

        expect(historial).toHaveAttribute('href', '/profile/ordenes');
        expect(seguir).toHaveAttribute('href', '/catalogo');
        expect(screen.queryByRole('link', { name: 'Volver al inicio' })).not.toBeInTheDocument();
    });
});
