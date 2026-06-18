import { beforeEach, describe, expect, it } from 'vitest';
import {
    addImages,
    create,
    deleteProduct,
    getAdmin,
    getByIdAdmin,
    getImages,
    update,
    updateStatus,
} from './productApi';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { mockProduct } from '@/test/msw/fixtures/products';

function seedAdminToken() {
    localStorage.setItem('token', mockAdminAuthTokenResponse.token);
    localStorage.setItem('rol', 'ROLE_ADMIN');
}

describe('productApi (admin)', () => {
    beforeEach(() => {
        seedAdminToken();
    });

    it('getAdmin devuelve productos por estado', async () => {
        const ocultos = await getAdmin('OCULTO');
        const descontinuados = await getAdmin('DESCONTINUADO');

        expect(ocultos).toEqual([]);
        expect(descontinuados).toEqual([]);
    });

    it('getByIdAdmin devuelve detalle admin', async () => {
        const producto = await getByIdAdmin(mockProduct.id);

        expect(producto.nombre).toBe(mockProduct.nombre);
        expect(producto.precioCosto).toBeGreaterThan(0);
    });

    it('create, update, imágenes y updateStatus', async () => {
        const created = await create({
            sku: 'ADMIN-NEW-001',
            nombre: 'Producto Admin Nuevo',
            descripcion: 'Creado en test',
            stock: 5,
            precio: { precioVenta: 49.99, precioCosto: 25, moneda: 'USD' },
            categoriaIds: [1, 2],
            imagenesUrl: ['https://placehold.co/400x400/png'],
        });

        expect(created.nombre).toBe('Producto Admin Nuevo');
        expect(created.slug).toBe('producto-admin-nuevo');

        const updated = await update(created.id, { nombre: 'Producto Admin Editado', stock: 8 });
        expect(updated?.nombre).toBe('Producto Admin Editado');

        const images = await addImages(created.id, ['https://placehold.co/300x300/png']);
        expect(images).toHaveLength(1);
        expect(images[0]?.url).toContain('300x300');

        const storedImages = await getImages(created.id);
        expect(storedImages).toHaveLength(2);

        await updateStatus(created.id, 'SIN_STOCK');
        const adminView = await getByIdAdmin(created.id);
        expect(adminView.estado).toBe('SIN_STOCK');
    });

    it('deleteProduct oculta el producto', async () => {
        const created = await create({
            sku: 'ADMIN-DEL-001',
            nombre: 'Producto a ocultar',
            stock: 1,
            precio: { precioVenta: 19.99, precioCosto: 10, moneda: 'USD' },
            categoriaIds: [2],
        });

        await deleteProduct(created.id);

        const ocultos = await getAdmin('OCULTO');
        expect(ocultos?.some((p) => p.id === created.id)).toBe(true);
    });
});
