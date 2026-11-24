import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import CategoriasNav from './CategoriasNav';
import { CategoriasContext } from '@/app/providers/categorias-context';
import type { CategoryApi } from '@/features/catalog';

const mockCategoryTree: CategoryApi[] = [
    {
        id: 1,
        nombre: 'Electrónica',
        slug: 'electronica',
        parentId: null,
        subcategorias: [
            {
                id: 2,
                nombre: 'Audio y Sonido',
                slug: 'audio-y-sonido',
                parentId: 1,
                subcategorias: [
                    {
                        id: 3,
                        nombre: 'Auriculares',
                        slug: 'auriculares',
                        parentId: 2,
                        subcategorias: [],
                    },
                ],
            },
        ],
    },
    {
        id: 4,
        nombre: 'Computación',
        slug: 'computacion',
        parentId: null,
        subcategorias: [],
    },
];

function renderWithCategorias(
    categories: CategoryApi[] = mockCategoryTree,
    loading = false
) {
    const mockContextValue = {
        arbolCategorias: categories,
        loading,
        reloadCategorias: async () => categories,
        createCategory: async () => categories[0],
        updateCategory: async () => categories[0],
        deleteCategory: async () => {},
    };

    return render(
        <MemoryRouter initialEntries={['/']}>
            <CategoriasContext.Provider value={mockContextValue}>
                <CategoriasNav />
            </CategoriasContext.Provider>
        </MemoryRouter>
    );
}

describe('Accesibilidad — CategoriasNav (Paso 1: Layout Público)', () => {
    it('el componente CategoriasNav cumple con las normas de accesibilidad de axe-core en reposo', async () => {
        const { container } = renderWithCategorias();

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('el componente cumple con las normas de accesibilidad cuando se abre el drawer móvil', async () => {
        const { container } = renderWithCategorias();

        const triggerButton = container.querySelector<HTMLButtonElement>(
            'button[aria-label="Abrir menú de categorías"]'
        );
        expect(triggerButton).not.toBeNull();
        fireEvent.click(triggerButton!);

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('el estado de carga (skeleton / loading) no introduce violaciones de accesibilidad', async () => {
        const { container } = renderWithCategorias([], true);

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
