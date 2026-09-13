import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProductFiltersPanel from './ProductFiltersPanel';
import type { CatalogFiltros } from '../../model/types';

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

        // Primeras 2 abiertas por defecto
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('(5)')).toBeInTheDocument();
        expect(screen.getByText('Negro')).toBeInTheDocument();
        expect(screen.getByText('(4)')).toBeInTheDocument();

        // Tercera cerrada por defecto
        expect(screen.queryByText('64 GB')).not.toBeInTheDocument();
    });

    it('abre una sección colapsada al hacer click en su encabezado', () => {
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

        const capacidadBtn = screen.getByRole('button', { name: /Capacidad/i });
        fireEvent.click(capacidadBtn);

        expect(screen.getByText('64 GB')).toBeInTheDocument();
        expect(screen.getByText('(1)')).toBeInTheDocument();
    });

    it('trunca las opciones a 5 por defecto y permite expandir con "+ Ver X más"', () => {
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

        // Abrir la tercera sección que tiene 6 opciones
        const capacidadBtn = screen.getByRole('button', { name: /Capacidad/i });
        fireEvent.click(capacidadBtn);

        // Primeras 5 visibles
        expect(screen.getByText('64 GB')).toBeInTheDocument();
        expect(screen.getByText('1 TB')).toBeInTheDocument();
        // La sexta no está visible aún
        expect(screen.queryByText('2 TB')).not.toBeInTheDocument();

        // Botón ver más
        const showMoreBtn = screen.getByRole('button', { name: /\+ Ver 1 más/i });
        expect(showMoreBtn).toBeInTheDocument();

        // Expandir
        fireEvent.click(showMoreBtn);
        expect(screen.getByText('2 TB')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Ver menos/i })).toBeInTheDocument();
    });
});

