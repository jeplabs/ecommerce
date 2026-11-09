import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProductFiltersPanel from './ProductFiltersPanel';
import type { CatalogFiltros } from '../../types';

describe('ProductFiltersPanel', () => {
    const mockFiltros: CatalogFiltros = {
        precioMin: 0,
        precioMax: 1000,
        specs: {
            Marca: [],
            Color: [],
            Capacidad: [],
        },
    };

    const mockFacetSections = [
        {
            key: 'Marca',
            options: [
                { matchValue: 'Apple', displayLabel: 'Apple', count: 5 },
                { matchValue: 'Samsung', displayLabel: 'Samsung', count: 3 },
            ],
        },
        {
            key: 'Color',
            options: [
                { matchValue: 'Negro', displayLabel: 'Negro', count: 4 },
                { matchValue: 'Blanco', displayLabel: 'Blanco', count: 2 },
            ],
        },
        {
            key: 'Capacidad',
            options: [
                { matchValue: '64GB', displayLabel: '64 GB', count: 1 },
                { matchValue: '128GB', displayLabel: '128 GB', count: 2 },
                { matchValue: '256GB', displayLabel: '256 GB', count: 3 },
                { matchValue: '512GB', displayLabel: '512 GB', count: 4 },
                { matchValue: '1TB', displayLabel: '1 TB', count: 5 },
                { matchValue: '2TB', displayLabel: '2 TB', count: 6 },
            ],
        },
    ];

    it('renderiza las dos primeras secciones abiertas por defecto y la tercera cerrada', () => {
        render(
            <ProductFiltersPanel
                facetSections={mockFacetSections}
                filtros={mockFiltros}
                precioMinBound={0}
                precioMaxBound={1000}
                onSpecToggle={vi.fn()}
                onPriceChange={vi.fn()}
                onClear={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: /marca/i })).toHaveAttribute(
            'aria-expanded',
            'true'
        );
        expect(screen.getByRole('button', { name: /color/i })).toHaveAttribute(
            'aria-expanded',
            'true'
        );
        expect(screen.getByRole('button', { name: /capacidad/i })).toHaveAttribute(
            'aria-expanded',
            'false'
        );

        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Negro')).toBeInTheDocument();
        expect(screen.queryByText('64 GB')).not.toBeInTheDocument();
    });

    it('abre la sección cerrada al hacer click en el encabezado', () => {
        render(
            <ProductFiltersPanel
                facetSections={mockFacetSections}
                filtros={mockFiltros}
                precioMinBound={0}
                precioMaxBound={1000}
                onSpecToggle={vi.fn()}
                onPriceChange={vi.fn()}
                onClear={vi.fn()}
            />
        );

        const capacidadBtn = screen.getByRole('button', { name: /capacidad/i });
        fireEvent.click(capacidadBtn);

        expect(capacidadBtn).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('64 GB')).toBeInTheDocument();
    });

    it('trunca opciones si hay más de 5 y muestra botón Ver más', () => {
        render(
            <ProductFiltersPanel
                facetSections={mockFacetSections}
                filtros={mockFiltros}
                precioMinBound={0}
                precioMaxBound={1000}
                onSpecToggle={vi.fn()}
                onPriceChange={vi.fn()}
                onClear={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /capacidad/i }));

        expect(screen.getByText('1 TB')).toBeInTheDocument();
        expect(screen.queryByText('2 TB')).not.toBeInTheDocument();

        const verMasBtn = screen.getByRole('button', { name: /ver más \(1\)/i });
        expect(verMasBtn).toBeInTheDocument();

        fireEvent.click(verMasBtn);

        expect(screen.getByText('2 TB')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ver menos/i })).toBeInTheDocument();
    });
});
