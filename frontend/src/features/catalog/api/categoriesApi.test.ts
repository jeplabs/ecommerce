import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API_BASE } from '@/test/msw/constants';
import { ApiError } from '@/lib';
import { setAccessToken, clearAuthTokens } from '@/lib/auth-token-store';
import { registerRefreshTokenHandler } from '@/lib/http-session';
import { resetDynamicProducts } from '@/test/msw/fixtures/products-registry';
import { categoriesApi } from './categoriesApi';

describe('categoriesApi', () => {
    beforeEach(() => {
        resetDynamicProducts();
        setAccessToken('initial-admin-jwt');
    });

    afterEach(() => {
        clearAuthTokens();
        registerRefreshTokenHandler(async () => null);
    });

    it('getAll retorna el árbol jerárquico de categorías', async () => {
        const tree = await categoriesApi.getAll();
        expect(tree).toHaveLength(1);
        expect(tree[0]?.nombre).toBe('Electrónica');
        expect(tree[0]?.subcategorias[0]?.nombre).toBe('Audio');
    });

    it('create reintenta automáticamente con fetchWithAuth ante un 401 si el refresh tiene éxito', async () => {
        let attempts = 0;
        server.use(
            http.post(`${API_BASE}/api/categorias`, ({ request }) => {
                attempts += 1;
                const auth = request.headers.get('Authorization');
                if (attempts === 1) {
                    expect(auth).toBe('Bearer initial-admin-jwt');
                    return HttpResponse.json({ error: 'Token expirado' }, { status: 401 });
                }
                expect(auth).toBe('Bearer refreshed-admin-jwt');
                return HttpResponse.json(
                    {
                        id: 55,
                        nombre: 'Periféricos',
                        slug: 'perifericos',
                        parentId: 1,
                        subcategorias: [],
                    },
                    { status: 201 }
                );
            })
        );

        const refreshSpy = vi.fn().mockImplementation(async () => {
            setAccessToken('refreshed-admin-jwt');
            return 'refreshed-admin-jwt';
        });
        registerRefreshTokenHandler(refreshSpy);

        const created = await categoriesApi.create({ nombre: 'Periféricos', parentId: 1 });
        expect(refreshSpy).toHaveBeenCalledTimes(1);
        expect(attempts).toBe(2);
        expect(created.id).toBe(55);
        expect(created.slug).toBe('perifericos');
    });

    it('deleteCategory lanza ApiError con status 409 y codigo CATEGORIA_CON_SUBCATEGORIAS cuando tiene hijas', async () => {
        await expect(categoriesApi.deleteCategory(1)).rejects.toMatchObject({
            name: 'ApiError',
            status: 409,
            data: expect.objectContaining({
                codigo: 'CATEGORIA_CON_SUBCATEGORIAS',
            }),
        });
    });

    it('deleteCategory lanza ApiError con status 409 y codigo CATEGORIA_CON_PRODUCTOS cuando tiene productos asociados', async () => {
        try {
            await categoriesApi.deleteCategory(2);
            expect.fail('Debió lanzar ApiError 409');
        } catch (err) {
            expect(err).toBeInstanceOf(ApiError);
            const apiErr = err as ApiError;
            expect(apiErr.status).toBe(409);
            expect((apiErr.data as { codigo?: string }).codigo).toBe('CATEGORIA_CON_PRODUCTOS');
            expect(apiErr.message).toMatch(/2 productos asociados/i);
        }
    });

    it('deleteCategory se resuelve sin error (204) para una categoría sin hijas ni productos', async () => {
        await expect(categoriesApi.deleteCategory(999)).resolves.toBeUndefined();
    });
});
