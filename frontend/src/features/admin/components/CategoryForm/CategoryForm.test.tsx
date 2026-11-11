import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mockCategories } from '@/test/msw/fixtures/categories';
import CategoryForm from './CategoryForm';

describe('CategoryForm', () => {
    it('muestra error si se envía el nombre vacío', async () => {
        const onCreate = vi.fn().mockResolvedValue(undefined);

        const { container } = render(<CategoryForm categorias={mockCategories} onCreate={onCreate} />);

        fireEvent.submit(container.querySelector('form')!);

        expect(await screen.findByText('El nombre de la categoría es obligatorio')).toBeInTheDocument();
        expect(onCreate).not.toHaveBeenCalled();
    });

    it('envía nombre y parentId null cuando no se selecciona categoría padre', async () => {
        const onCreate = vi.fn().mockResolvedValue(undefined);

        render(<CategoryForm categorias={mockCategories} onCreate={onCreate} />);

        const input = screen.getByLabelText('Nombre') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '  Periféricos  ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }));

        await waitFor(() => {
            expect(onCreate).toHaveBeenCalledWith({
                nombre: 'Periféricos',
                parentId: null,
            });
        });

        expect(input.value).toBe('');
    });

    it('envía parentId numérico cuando se selecciona categoría padre y refleja isLoading', async () => {
        const onCreate = vi.fn().mockResolvedValue(undefined);

        const { rerender } = render(
            <CategoryForm categorias={mockCategories} onCreate={onCreate} isLoading={false} />
        );

        fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Auriculares' } });
        fireEvent.change(screen.getByLabelText('Categoría padre (opcional)'), {
            target: { value: '1' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }));

        await waitFor(() => {
            expect(onCreate).toHaveBeenCalledWith({
                nombre: 'Auriculares',
                parentId: 1,
            });
        });

        rerender(<CategoryForm categorias={mockCategories} onCreate={onCreate} isLoading />);
        expect(screen.getByRole('button', { name: 'Creando...' })).toBeDisabled();
    });
});
