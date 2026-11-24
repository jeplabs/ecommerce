import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminCategoriesTable } from './AdminCategoriesTable';
import type { CategoryApi } from '@/features/catalog';

const testCategories: CategoryApi[] = [
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

describe('AdminCategoriesTable', () => {
    it('renderiza la lista de categorías con sus niveles y slugs', () => {
        render(
            <AdminCategoriesTable
                categories={testCategories}
                onAddSubcategory={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(screen.getByText('Computación')).toBeInTheDocument();
        expect(screen.getByText('computacion')).toBeInTheDocument();
        expect(screen.getByText('Laptops')).toBeInTheDocument();
        expect(screen.getByText('Audio')).toBeInTheDocument();
        expect(screen.getAllByText('Raíz')).toHaveLength(2);
        expect(screen.getByText('Nivel 1')).toBeInTheDocument();
    });

    it('permite contraer y expandir ramas jerárquicas con el chevron', () => {
        render(
            <AdminCategoriesTable
                categories={testCategories}
                onAddSubcategory={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        // Por defecto las raíces están expandidas y se ve Laptops
        expect(screen.getByText('Laptops')).toBeInTheDocument();

        // Pulsar el botón para contraer la categoría Computación
        const toggleBtn = screen.getByRole('button', { name: /Contraer/i });
        fireEvent.click(toggleBtn);

        // Ya no debe verse Laptops en el documento
        expect(screen.queryByText('Laptops')).not.toBeInTheDocument();

        // Volver a pulsar para expandir
        const expandBtn = screen.getByRole('button', { name: /Expandir/i });
        fireEvent.click(expandBtn);

        expect(screen.getByText('Laptops')).toBeInTheDocument();
    });

    it('filtra en tiempo real según el término de búsqueda', () => {
        render(
            <AdminCategoriesTable
                categories={testCategories}
                searchFilter="audio"
                onAddSubcategory={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(screen.getByText('Audio')).toBeInTheDocument();
        expect(screen.queryByText('Computación')).not.toBeInTheDocument();
    });

    it('muestra estado vacío si el filtro no encuentra coincidencias', () => {
        render(
            <AdminCategoriesTable
                categories={testCategories}
                searchFilter="inexistente"
                onAddSubcategory={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(screen.getByText(/No se encontraron categorías/i)).toBeInTheDocument();
    });

    it('invoca onAddSubcategory al pulsar + Hija', () => {
        const onAddSubcategory = vi.fn();
        render(
            <AdminCategoriesTable
                categories={testCategories}
                onAddSubcategory={onAddSubcategory}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        const addHijaBtns = screen.getAllByRole('button', { name: /\+ Hija/i });
        fireEvent.click(addHijaBtns[0]);

        expect(onAddSubcategory).toHaveBeenCalledTimes(1);
        expect(onAddSubcategory).toHaveBeenCalledWith(testCategories[0]);
    });

    it('invoca onEdit al pulsar Editar', () => {
        const onEdit = vi.fn();
        render(
            <AdminCategoriesTable
                categories={testCategories}
                onAddSubcategory={vi.fn()}
                onEdit={onEdit}
                onDelete={vi.fn()}
            />
        );

        const editBtns = screen.getAllByRole('button', { name: /Editar/i });
        fireEvent.click(editBtns[0]);

        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(onEdit).toHaveBeenCalledWith(testCategories[0]);
    });

    it('invoca onDelete al pulsar Eliminar', () => {
        const onDelete = vi.fn();
        render(
            <AdminCategoriesTable
                categories={testCategories}
                onAddSubcategory={vi.fn()}
                onEdit={vi.fn()}
                onDelete={onDelete}
            />
        );

        const deleteBtns = screen.getAllByRole('button', { name: /Eliminar/i });
        fireEvent.click(deleteBtns[0]);

        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(onDelete).toHaveBeenCalledWith(testCategories[0]);
    });
});
