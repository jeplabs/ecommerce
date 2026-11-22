import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProductAdminApi } from '@/features/catalog';
import AdminProductsTable from './AdminProductsTable';

const mockProducts: ProductAdminApi[] = [
    {
        id: 1,
        sku: 'SKU-TEST-001',
        nombre: 'Teclado Mecánico RGB',
        slug: 'teclado-mecanico-rgb',
        stock: 25,
        estado: 'DISPONIBLE',
        precioVenta: 89.99,
        precioCosto: 45.0,
        margenPorcentaje: 50.0,
        moneda: 'USD',
        imagenes: [
            { id: 1, url: 'https://example.com/teclado.jpg', principal: true },
        ],
        createdAt: '2026-05-01T10:00:00',
        categorias: [{ id: 10, nombre: 'Periféricos', slug: 'perifericos', subcategorias: [] }],
    },
    {
        id: 2,
        sku: 'SKU-TEST-002',
        nombre: 'Mouse Inalámbrico Pro',
        slug: 'mouse-inalambrico-pro',
        stock: 0,
        estado: 'SIN_STOCK',
        precioVenta: 49.99,
        precioCosto: 20.0,
        margenPorcentaje: 60.0,
        moneda: 'USD',
        imagenes: [],
        createdAt: '2026-05-02T10:00:00',
        categorias: [],
    },
    {
        id: 3,
        sku: 'SKU-TEST-003',
        nombre: 'Monitor 4K Antiguo',
        slug: 'monitor-4k-antiguo',
        stock: 0,
        estado: 'DESCONTINUADO',
        precioVenta: 399.99,
        precioCosto: 300.0,
        margenPorcentaje: 25.0,
        moneda: 'USD',
        imagenes: [],
        createdAt: '2026-01-01T10:00:00',
        categorias: [],
    },
];

describe('AdminProductsTable', () => {
    it('renderiza encabezados y datos de los productos en la tabla', () => {
        render(
            <AdminProductsTable
                productos={mockProducts}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(screen.getByRole('region', { name: 'Tabla de productos' })).toBeInTheDocument();
        expect(screen.getByText('Teclado Mecánico RGB')).toBeInTheDocument();
        expect(screen.getByText('SKU-TEST-001')).toBeInTheDocument();
        expect(screen.getByText('Periféricos')).toBeInTheDocument();
        expect(screen.getByText('Disponible')).toBeInTheDocument();
        expect(screen.getByText('Sin stock')).toBeInTheDocument();
        expect(screen.getByText('Descontinuado')).toBeInTheDocument();
    });

    it('ejecuta onEdit al presionar el botón de editar', () => {
        const onEdit = vi.fn();
        render(
            <AdminProductsTable
                productos={mockProducts}
                onEdit={onEdit}
                onDelete={vi.fn()}
            />
        );

        const editBtn = screen.getByRole('button', { name: 'Editar Teclado Mecánico RGB' });
        fireEvent.click(editBtn);

        expect(onEdit).toHaveBeenCalledWith(1);
    });

    it('ejecuta onDelete al presionar el botón de eliminar y oculta eliminar en descontinuados', () => {
        const onDelete = vi.fn();
        render(
            <AdminProductsTable
                productos={mockProducts}
                onEdit={vi.fn()}
                onDelete={onDelete}
            />
        );

        const deleteBtn = screen.getByRole('button', { name: 'Eliminar Teclado Mecánico RGB' });
        fireEvent.click(deleteBtn);

        expect(onDelete).toHaveBeenCalledWith(1, 'Teclado Mecánico RGB');

        // Producto 3 está DESCONTINUADO, no debe tener botón de eliminar
        expect(screen.queryByRole('button', { name: 'Eliminar Monitor 4K Antiguo' })).not.toBeInTheDocument();
    });
});
