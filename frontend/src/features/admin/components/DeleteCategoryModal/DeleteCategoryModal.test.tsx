import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeleteCategoryModal } from './DeleteCategoryModal';
import type { CategoryApi } from '@/features/catalog';

const categoryWithChildren: CategoryApi = {
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
            subcategorias: [],
        },
    ],
};

const categoryWithoutChildren: CategoryApi = {
    id: 5,
    nombre: 'Accesorios Varios',
    slug: 'accesorios-varios',
    parentId: null,
    subcategorias: [],
};

describe('DeleteCategoryModal', () => {
    it('no renderiza nada si isOpen es false o category es null', () => {
        const { container } = render(
            <DeleteCategoryModal
                isOpen={false}
                category={categoryWithoutChildren}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('bloquea el botón de eliminar y muestra alerta si la categoría tiene subcategorías', () => {
        render(
            <DeleteCategoryModal
                isOpen={true}
                category={categoryWithChildren}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
            />
        );

        expect(screen.getByRole('heading', { name: /Eliminar categoría/i })).toBeInTheDocument();
        expect(screen.getByText(/Acción bloqueada/i)).toBeInTheDocument();
        expect(screen.getByText(/1 subcategoría/i)).toBeInTheDocument();

        const deleteBtn = screen.getByRole('button', { name: /Eliminar definitivamente/i });
        expect(deleteBtn).toBeDisabled();
    });

    it('habilita el botón de eliminar y ejecuta onConfirm si no tiene subcategorías', async () => {
        const onConfirm = vi.fn().mockResolvedValue(true);
        const onClose = vi.fn();

        render(
            <DeleteCategoryModal
                isOpen={true}
                category={categoryWithoutChildren}
                onClose={onClose}
                onConfirm={onConfirm}
            />
        );

        expect(screen.queryByText(/Acción bloqueada/i)).not.toBeInTheDocument();

        const deleteBtn = screen.getByRole('button', { name: /Eliminar definitivamente/i });
        expect(deleteBtn).not.toBeDisabled();

        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(onConfirm).toHaveBeenCalledWith(categoryWithoutChildren);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it('invoca onClose al pulsar el botón Cancelar o la X', () => {
        const onClose = vi.fn();

        render(
            <DeleteCategoryModal
                isOpen={true}
                category={categoryWithoutChildren}
                onClose={onClose}
                onConfirm={vi.fn()}
            />
        );

        const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
        fireEvent.click(cancelBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
