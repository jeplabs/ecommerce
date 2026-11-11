import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mockCategories } from '@/test/msw/fixtures/categories';
import AdminProductFilters from './AdminProductFilters';

describe('AdminProductFilters', () => {
    const baseProps = {
        searchQuery: '',
        onSearchChange: vi.fn(),
        categoriaId: '' as const,
        onCategoryChange: vi.fn(),
        estadoFiltro: '' as const,
        onStatusChange: vi.fn(),
        pageSize: 24,
        onPageSizeChange: vi.fn(),
        categorias: mockCategories,
        totalElements: 560,
        currentCount: 24,
        page: 1,
        loading: false,
        hasActiveFilters: false,
        onClearFilters: vi.fn(),
    };

    it('renderiza controles de búsqueda, categorías jerárquicas, estado, tamaño y rango total', () => {
        render(<AdminProductFilters {...baseProps} />);

        expect(screen.getByLabelText('Buscar producto')).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Electrónica' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: '— Audio' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Todos los estados' })).toBeInTheDocument();
        expect(
            screen.getByText(
                (_, el) =>
                    el?.tagName === 'P' &&
                    /Mostrando 1\s*–\s*24 de 560 productos/.test(
                        el.textContent?.replace(/\s+/g, ' ').trim() ?? ''
                    )
            )
        ).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
    });

    it('dispara callbacks al cambiar búsqueda, categoría, estado, tamaño de página y limpiar', () => {
        const onSearchChange = vi.fn();
        const onCategoryChange = vi.fn();
        const onStatusChange = vi.fn();
        const onPageSizeChange = vi.fn();
        const onClearFilters = vi.fn();

        render(
            <AdminProductFilters
                {...baseProps}
                searchQuery="Laptop"
                hasActiveFilters
                onSearchChange={onSearchChange}
                onCategoryChange={onCategoryChange}
                onStatusChange={onStatusChange}
                onPageSizeChange={onPageSizeChange}
                onClearFilters={onClearFilters}
            />
        );

        fireEvent.change(screen.getByLabelText('Buscar producto'), {
            target: { value: 'RTX' },
        });
        expect(onSearchChange).toHaveBeenCalledWith('RTX');

        fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
        expect(onSearchChange).toHaveBeenCalledWith('');

        fireEvent.change(screen.getByLabelText('Categoría'), {
            target: { value: '2' },
        });
        expect(onCategoryChange).toHaveBeenCalledWith(2);

        fireEvent.change(screen.getByLabelText('Estado'), {
            target: { value: 'OCULTO' },
        });
        expect(onStatusChange).toHaveBeenCalledWith('OCULTO');

        fireEvent.change(screen.getByLabelText('Mostrar'), {
            target: { value: '48' },
        });
        expect(onPageSizeChange).toHaveBeenCalledWith(48);

        fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
        expect(onClearFilters).toHaveBeenCalledTimes(1);
    });
});
