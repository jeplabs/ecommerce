import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mockCategories } from '@/test/msw/fixtures/categories';
import { ProductForm } from './ProductForm';

describe('ProductForm', () => {
    it('muestra errores de validación cuando faltan campos obligatorios e imágenes al crear', () => {
        const onSubmit = vi.fn();

        render(<ProductForm onSubmit={onSubmit} arbolCategorias={mockCategories} />);

        fireEvent.click(screen.getByRole('button', { name: 'Agregar Producto' }));

        expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
        expect(screen.getByText('El SKU es obligatorio')).toBeInTheDocument();
        expect(screen.getByText('La descripción es obligatoria')).toBeInTheDocument();
        expect(screen.getByText('El precio es obligatorio')).toBeInTheDocument();
        expect(screen.getByText('El stock es obligatorio')).toBeInTheDocument();
        expect(
            screen.getByText('Debe seleccionar al menos una imagen del producto')
        ).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('permite completar formulario en cascada, agregar URL de imagen y enviar payload', () => {
        const onSubmit = vi.fn();
        const onCancel = vi.fn();

        render(
            <ProductForm
                onSubmit={onSubmit}
                onCancel={onCancel}
                arbolCategorias={mockCategories}
            />
        );

        fireEvent.change(screen.getByLabelText('Nombre'), {
            target: { value: 'Teclado Mecánico' },
        });
        fireEvent.change(screen.getByLabelText('SKU'), {
            target: { value: 'KB-2026' },
        });
        fireEvent.change(screen.getByLabelText('Descripción'), {
            target: { value: 'Switches táctiles silenciosos' },
        });
        fireEvent.change(screen.getByLabelText('Precio'), {
            target: { value: '99.5' },
        });
        fireEvent.change(screen.getByLabelText('Moneda'), {
            target: { value: 'GTQ' },
        });
        fireEvent.change(screen.getByLabelText('Stock'), {
            target: { value: '15' },
        });
        fireEvent.change(screen.getByLabelText('Categoria'), {
            target: { value: '1' },
        });
        fireEvent.change(screen.getByLabelText('Subcategoria'), {
            target: { value: '2' },
        });

        fireEvent.change(screen.getByPlaceholderText('https://ejemplo.com/imagen.jpg'), {
            target: { value: 'https://cdn.example.com/kb.jpg' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Agregar URL' }));

        expect(screen.getByAltText('Vista previa')).toHaveAttribute(
            'src',
            'https://cdn.example.com/kb.jpg'
        );
        expect(screen.getByText('PRINCIPAL')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Agregar Producto' }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
        const [payload, images] = onSubmit.mock.calls[0]!;
        expect(payload).toMatchObject({
            sku: 'KB-2026',
            nombre: 'Teclado Mecánico',
            descripcion: 'Switches táctiles silenciosos',
            stock: 15,
            estado: 'disponible',
            precio: {
                precioVenta: 99.5,
                moneda: 'GTQ',
            },
            categoriaIds: [1, 2],
            imagenesUrl: ['https://cdn.example.com/kb.jpg'],
        });
        expect(images).toHaveLength(1);

        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('en modo edición deshabilita SKU, rellena valores iniciales y muestra Actualizar Producto', () => {
        const onSubmit = vi.fn();

        render(
            <ProductForm
                onSubmit={onSubmit}
                arbolCategorias={mockCategories}
                initialData={{
                    nombre: 'Auriculares Pro',
                    sku: 'AUD-100',
                    descripcion: 'Cancelación activa',
                    price: 149,
                    stock: 8,
                    estado: 'disponible',
                    moneda: 'USD',
                    categorias: [
                        { id: 1, parentId: null },
                        { id: 2, parentId: 1 },
                    ],
                }}
            />
        );

        const skuInput = screen.getByLabelText('SKU') as HTMLInputElement;
        expect(skuInput).toBeDisabled();
        expect(skuInput.value).toBe('AUD-100');

        const submitBtn = screen.getByRole('button', { name: 'Actualizar Producto' });
        fireEvent.click(submitBtn);

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });
});
