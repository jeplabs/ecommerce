import { render, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ProductFilters } from './ProductFilters';
import { createDefaultFiltros, extractFilterFacets } from '../../lib/filter-facets';
import { catalogProductsFixture } from '@/test/fixtures/catalog-products';

describe('Accesibilidad — ProductFilters (Paso 2: Catálogo y Búsqueda)', () => {
    const opciones = extractFilterFacets(catalogProductsFixture);
    const defaultFiltros = createDefaultFiltros(opciones);

    it('el panel de filtros cumple con las normas de accesibilidad de axe-core en reposo', async () => {
        const { container } = render(
            <ProductFilters
                productos={catalogProductsFixture}
                filtros={defaultFiltros}
                onFilterChange={vi.fn()}
            />
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('el drawer móvil de filtros cumple con las normas de accesibilidad al abrirse', async () => {
        render(
            <ProductFilters
                productos={catalogProductsFixture}
                filtros={defaultFiltros}
                onFilterChange={vi.fn()}
            />
        );

        const fabButton = document.querySelector<HTMLButtonElement>(
            'button[aria-label="Abrir panel de filtros"]'
        );
        expect(fabButton).not.toBeNull();
        fireEvent.click(fabButton!);

        const drawer = document.getElementById('product-filters-drawer');
        expect(drawer).not.toBeNull();

        const results = await axe(drawer!);

        expect(results).toHaveNoViolations();
    });
});
