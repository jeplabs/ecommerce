import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useProductFilterForm } from './useProductFilterForm';
import type { CatalogFilterOpciones, CatalogFiltros } from '../types';

const opcionesMock: CatalogFilterOpciones = {
    facetKeys: ['Marca'],
    specFacets: {
        Marca: [{ matchValue: 'Apple', displayLabel: 'Apple', count: 5 }],
    },
    precioMin: 0,
    precioMax: 1000,
};

const filtrosMock: CatalogFiltros = {
    specs: { Marca: [] },
    precioMin: 0,
    precioMax: 1000,
};

describe('useProductFilterForm', () => {
    it('inicia con el drawer cerrado y filtros base', () => {
        const onFilterChange = vi.fn();
        const { result } = renderHook(() =>
            useProductFilterForm({
                filtros: filtrosMock,
                opciones: opcionesMock,
                onFilterChange,
            })
        );

        expect(result.current.isDrawerOpen).toBe(false);
        expect(result.current.draftFiltros.precioMin).toBe(0);
        expect(result.current.draftFiltros.precioMax).toBe(1000);
    });

    it('abre y cierra el drawer correctamente', () => {
        const onFilterChange = vi.fn();
        const { result } = renderHook(() =>
            useProductFilterForm({
                filtros: filtrosMock,
                opciones: opcionesMock,
                onFilterChange,
            })
        );

        act(() => {
            result.current.openDrawer();
        });
        expect(result.current.isDrawerOpen).toBe(true);

        act(() => {
            result.current.closeDrawer();
        });
        expect(result.current.isDrawerOpen).toBe(false);
    });

    it('notifica onFilterChange inmediatamente en modo directo', () => {
        const onFilterChange = vi.fn();
        const { result } = renderHook(() =>
            useProductFilterForm({
                filtros: filtrosMock,
                opciones: opcionesMock,
                onFilterChange,
            })
        );

        act(() => {
            result.current.toggleSpec('Marca', 'Apple', { draft: false });
        });

        expect(onFilterChange).toHaveBeenCalledTimes(1);
        expect(onFilterChange).toHaveBeenCalledWith(
            expect.objectContaining({
                specs: { Marca: ['Apple'] },
            })
        );
    });

    it('aplica borrador al confirmar en modo drawer', () => {
        const onFilterChange = vi.fn();
        const { result } = renderHook(() =>
            useProductFilterForm({
                filtros: filtrosMock,
                opciones: opcionesMock,
                onFilterChange,
            })
        );

        act(() => {
            result.current.openDrawer();
            result.current.toggleSpec('Marca', 'Apple', { draft: true });
        });

        expect(onFilterChange).not.toHaveBeenCalled();

        act(() => {
            result.current.applyDraft();
        });

        expect(onFilterChange).toHaveBeenCalledWith(
            expect.objectContaining({
                specs: { Marca: ['Apple'] },
            })
        );
        expect(result.current.isDrawerOpen).toBe(false);
    });
});
