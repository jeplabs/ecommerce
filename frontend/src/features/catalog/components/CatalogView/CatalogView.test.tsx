import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CatalogView } from './CatalogView';

vi.mock('../ProductCatalog/ProductCatalog', () => ({
    ProductCatalog: () => <div data-testid="product-catalog-mock">Product Catalog Mock</div>,
}));

describe('CatalogView (BPR)', () => {
    it('renderiza encabezado, breadcrumbs y el catálogo', () => {
        render(
            <MemoryRouter>
                <CatalogView />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { level: 1, name: /catálogo/i })).toBeInTheDocument();
        expect(screen.getByTestId('product-catalog-mock')).toBeInTheDocument();
    });
});
