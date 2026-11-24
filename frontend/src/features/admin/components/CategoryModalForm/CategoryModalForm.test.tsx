import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CategoryModalForm } from './CategoryModalForm';
import type { CategoryApi } from '@/features/catalog';

const mockCategoriesTree: CategoryApi[] = [
    {
        id: 1,
        nombre: 'Computación',
        slug: 'computacion',
        parentId: null,
        subcategorias: [
            {
                id: 2,
                nombre: 'Laptops',
                slug: 'laptops',
                parentId: 1,
                subcategorias: [
                    {
                        id: 3,
                        nombre: 'Laptops Gamer',
                        slug: 'laptops-gamer',
                        parentId: 2,
                        subcategorias: [],
                    },
                ],
            },
        ],
    },
    {
        id: 4,
        nombre: 'Audio',
        slug: 'audio',
        parentId: null,
        subcategorias: [],
    },
];

describe('CategoryModalForm', () => {
    it('no renderiza nada si isOpen es false', () => {
        const { container } = render(
            <CategoryModalForm
                isOpen={false}
                onClose={vi.fn()}
                allCategories={mockCategoriesTree}
                onSave={vi.fn()}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('renderiza modo creación con título "Nueva categoría" y genera preview del slug', () => {
        render(
            <CategoryModalForm
                isOpen={true}
                onClose={vi.fn()}
                allCategories={mockCategoriesTree}
                onSave={vi.fn()}
            />
        );

        expect(screen.getByRole('heading', { name: /Nueva categoría/i })).toBeInTheDocument();
        const input = screen.getByLabelText(/Nombre de la categoría/i);

        fireEvent.change(input, { target: { value: 'Cámaras Fotográficas' } });

        expect(screen.getByText('camaras-fotograficas')).toBeInTheDocument();
    });

    it('renderiza modo edición con título "Editar categoría" y valores precargados', () => {
        const categoryToEdit = mockCategoriesTree[0]?.subcategorias[0]; // Laptops
        render(
            <CategoryModalForm
                isOpen={true}
                onClose={vi.fn()}
                categoryToEdit={categoryToEdit}
                allCategories={mockCategoriesTree}
                onSave={vi.fn()}
            />
        );

        expect(screen.getByRole('heading', { name: /Editar categoría/i })).toBeInTheDocument();
        const input = screen.getByLabelText(/Nombre de la categoría/i) as HTMLInputElement;
        expect(input.value).toBe('Laptops');
    });

    it('excluye a la categoría actual y a sus descendientes del selector de padre (anti-ciclos)', () => {
        // Editamos "Computación" (id: 1). Ni ella ni "Laptops" ni "Laptops Gamer" deben aparecer como padre posible.
        const categoryToEdit = mockCategoriesTree[0];
        render(
            <CategoryModalForm
                isOpen={true}
                onClose={vi.fn()}
                categoryToEdit={categoryToEdit}
                allCategories={mockCategoriesTree}
                onSave={vi.fn()}
            />
        );

        const select = screen.getByLabelText(/Categoría padre/i);
        const options = Array.from(select.querySelectorAll('option')).map((o) => o.textContent);

        expect(options).toContain('-- Ninguno (Categoría Raíz) --');
        expect(options).toContain('Audio');
        expect(options).not.toContain('Computación');
        expect(options).not.toContain('Computación > Laptops');
        expect(options).not.toContain('Computación > Laptops > Laptops Gamer');
    });

    it('valida que el nombre tenga al menos 2 caracteres', async () => {
        render(
            <CategoryModalForm
                isOpen={true}
                onClose={vi.fn()}
                allCategories={mockCategoriesTree}
                onSave={vi.fn()}
            />
        );

        const input = screen.getByLabelText(/Nombre de la categoría/i);
        fireEvent.change(input, { target: { value: 'A' } });

        const submitBtn = screen.getByRole('button', { name: /Crear categoría/i });
        fireEvent.click(submitBtn);

        expect(await screen.findByText(/al menos 2 caracteres/i)).toBeInTheDocument();
    });

    it('llama a onSave con el payload correcto y cierra al ser exitoso', async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        const onClose = vi.fn();

        render(
            <CategoryModalForm
                isOpen={true}
                onClose={onClose}
                allCategories={mockCategoriesTree}
                onSave={onSave}
            />
        );

        fireEvent.change(screen.getByLabelText(/Nombre de la categoría/i), {
            target: { value: 'Impresoras' },
        });
        fireEvent.change(screen.getByLabelText(/Categoría padre/i), {
            target: { value: '1' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Crear categoría/i }));

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith({
                nombre: 'Impresoras',
                parentId: 1,
            });
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
