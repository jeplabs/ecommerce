import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { categoryApi } from './categoryApi';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { mockCategories } from '@/test/msw/fixtures/categories';
import { API_BASE } from '@/test/msw/constants';
import { server } from '@/test/msw/server';

const categoriasPath = `${API_BASE}/api/categorias`;

describe('categoryApi', () => {
    it('getAll devuelve el árbol jerárquico', async () => {
        const result = await categoryApi.getAll();

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

        await expect(categoryApi.getAll()).rejects.toThrow('Fallo al cargar');
    });

    it('getAll lanza Error con mensaje por defecto si el body no trae error', async () => {
        server.use(http.get(categoriasPath, () => HttpResponse.text('oops', { status: 500 })));

        await expect(categoryApi.getAll()).rejects.toThrow('Error al cargar categorías');
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

        const result = await categoryApi.create({ nombre: 'Nueva categoría' });

        expect(received).toEqual({ nombre: 'Nueva categoría' });
        expect(result.id).toBe(mockCategories[0]?.id);
    });

    it('create lanza "Sesión expirada" con 401 y limpia la sesión', async () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);
        server.use(
            http.post(categoriasPath, () =>
                HttpResponse.json({ error: 'No autorizado' }, { status: 401 })
            )
        );

        await expect(categoryApi.create({ nombre: 'Nueva' })).rejects.toThrow(
            'Sesión expirada. Por favor inicia sesión nuevamente.'
        );
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('create lanza Error con el mensaje del body al fallar', async () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);
        server.use(
            http.post(categoriasPath, () =>
                HttpResponse.json({ error: 'No se pudo crear' }, { status: 400 })
            )
        );

        await expect(categoryApi.create({ nombre: 'Nueva' })).rejects.toThrow(
            'No se pudo crear'
        );
    });
});
