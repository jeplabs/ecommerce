import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { FavoritesList } from './FavoritesList';
import { FavoriteButton } from '../FavoriteButton';
import { catalogProductsFixture } from '@/test/fixtures/catalog-products';

describe('Accesibilidad — FavoritesList y FavoriteButton', () => {
    it('cumple con WCAG 2.1 AA en FavoritesList', async () => {
        const { container } = render(
            <MemoryRouter>
                <AppProviders>
                    <FavoritesList />
                </AppProviders>
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { level: 2, name: /mis favoritos/i })).toBeInTheDocument();

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('cumple con WCAG 2.1 AA en FavoriteButton', async () => {
        const { container } = render(
            <MemoryRouter>
                <AppProviders>
                    <FavoriteButton product={catalogProductsFixture[0]} />
                </AppProviders>
            </MemoryRouter>
        );

        const button = screen.getByRole('button', { name: /añadir a favoritos/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-pressed', 'false');

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
