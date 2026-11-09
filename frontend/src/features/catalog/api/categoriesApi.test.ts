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
});
