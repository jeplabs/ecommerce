import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { categoriesApi } from './categoriesApi';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { mockCategories } from '@/test/msw/fixtures/categories';
import { API_BASE } from '@/test/msw/constants';
import { server } from '@/test/msw/server';

const categoriasPath = `${API_BASE}/api/categorias`;

describe('categoriesApi', () => {
    it('getAll devuelve el árbol jerárquico', async () => {
        const result = await categoriesApi.getAll();

        expect(result.length).toBeGreaterThan(0);
        expect(result[0]?.nombre).toBe('Electrónica');
        expect(result[0]?.subcategorias[0]?.nombre).toBe('Audio');
    });

    it('getAll lanza Error con el mensaje del body al fallar', async () => {
        server.use(
            http.get(categoriasPath, () =>
                HttpResponse.json({ error: 'Fallo al cargar' }, { status: 500 })
            )
        );

        await expect(categoriesApi.getAll()).rejects.toThrow('Fallo al cargar');
    });

    it('getAll lanza Error con mensaje por defecto si el body no trae error', async () => {
        server.use(http.get(categoriasPath, () => HttpResponse.text('oops', { status: 500 })));

        await expect(categoriesApi.getAll()).rejects.toThrow('Error al cargar categorías');
    });

    it('create envía el body y devuelve la categoría creada', async () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);
        let received: unknown;
        server.use(
            http.post(categoriasPath, async ({ request }) => {
                received = await request.json();
                return HttpResponse.json(mockCategories[0], { status: 201 });
            })
        );

        const result = await categoriesApi.create({ nombre: 'Nueva categoría BPR' });

        expect(received).toEqual({ nombre: 'Nueva categoría BPR' });
        expect(result.id).toBe(mockCategories[0]?.id);
    });

    it('update envía PATCH con el body y devuelve la categoría actualizada', async () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);
        let received: unknown;
        server.use(
            http.patch(`${categoriasPath}/2`, async ({ request }) => {
                received = await request.json();
                return HttpResponse.json({
                    id: 2,
                    nombre: 'Audio Pro',
                    slug: 'audio-pro',
                    parentId: 1,
                    subcategorias: [],
                });
            })
        );

        const result = await categoriesApi.update(2, { nombre: 'Audio Pro', parentId: 1 });

        expect(received).toEqual({ nombre: 'Audio Pro', parentId: 1 });
        expect(result.nombre).toBe('Audio Pro');
        expect(result.id).toBe(2);
    });

    it('update lanza Error si el endpoint responde con fallo', async () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);
        server.use(
            http.patch(`${categoriasPath}/99`, () =>
                HttpResponse.json({ message: 'Categoría no encontrada' }, { status: 404 })
            )
        );

        await expect(categoriesApi.update(99, { nombre: 'Inexistente' })).rejects.toThrow(
            'Categoría no encontrada'
        );
    });

    it('deleteCategory envía DELETE al endpoint correspondiente', async () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);
        let deleteCalled = false;
        server.use(
            http.delete(`${categoriasPath}/5`, () => {
                deleteCalled = true;
                return new HttpResponse(null, { status: 204 });
            })
        );

        await categoriesApi.deleteCategory(5);

        expect(deleteCalled).toBe(true);
    });

    it('deleteCategory lanza Error si el backend rechaza la eliminación', async () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);
        server.use(
            http.delete(`${categoriasPath}/1`, () =>
                HttpResponse.json(
                    { error: 'No es posible eliminar una categoría con subcategorías activas' },
                    { status: 409 }
                )
            )
        );

        await expect(categoriesApi.deleteCategory(1)).rejects.toThrow(
            'No es posible eliminar una categoría con subcategorías activas'
        );
    });
});
