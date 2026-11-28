import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setAccessToken, clearAuthTokens } from '@/lib/auth-token-store';
import { resetDynamicSynonyms } from '@/test/msw/fixtures/synonyms-registry';
import * as catalogApi from './catalogApi';
import { searchSynonymsApi } from './searchSynonymsApi';

describe('searchSynonymsApi', () => {
    beforeEach(() => {
        resetDynamicSynonyms();
        setAccessToken('admin-jwt-token');
    });

    afterEach(() => {
        clearAuthTokens();
        vi.restoreAllMocks();
    });

    it('getAll lista todos los grupos de sinónimos ordenados por nombreGrupo', async () => {
        const groups = await searchSynonymsApi.getAll();
        expect(groups).toHaveLength(3);
        expect(groups.map((g) => g.nombreGrupo)).toEqual(['audio', 'laptops', 'monitores']);
    });

    it('create normaliza términos con tildes, valida con Zod e invalida catalogoCache', async () => {
        const invalidateSpy = vi.spyOn(catalogApi, 'invalidateCatalogoCache');
        const created = await searchSynonymsApi.create({
            nombreGrupo: 'ratones',
            terminos: ['Ratón', 'Mouse', 'Trackball'],
            activo: true,
        });

        expect(created.nombreGrupo).toBe('ratones');
        expect(created.terminos).toEqual(['raton', 'mouse', 'trackball']);
        expect(created.activo).toBe(true);
        expect(invalidateSpy).toHaveBeenCalledTimes(1);
    });

    it('create lanza ApiError 400 si el grupo tiene menos de 2 términos válidos', async () => {
        await expect(
            searchSynonymsApi.create({
                nombreGrupo: 'invalido',
                terminos: ['solo-uno'],
            })
        ).rejects.toMatchObject({
            name: 'ApiError',
            status: 400,
        });
    });

    it('update actualiza términos del grupo e invalida catalogoCache', async () => {
        const invalidateSpy = vi.spyOn(catalogApi, 'invalidateCatalogoCache');
        const updated = await searchSynonymsApi.update(1, {
            nombreGrupo: 'laptops-pro',
            terminos: ['laptop', 'macbook', 'ultrabook'],
            activo: true,
        });

        expect(updated.nombreGrupo).toBe('laptops-pro');
        expect(updated.terminos).toEqual(['laptop', 'macbook', 'ultrabook']);
        expect(invalidateSpy).toHaveBeenCalledTimes(1);
    });

    it('toggleStatus invierte el estado activo e invalida catalogoCache', async () => {
        const invalidateSpy = vi.spyOn(catalogApi, 'invalidateCatalogoCache');
        const toggled = await searchSynonymsApi.toggleStatus(1);
        expect(toggled.activo).toBe(false);
        expect(invalidateSpy).toHaveBeenCalledTimes(1);
    });

    it('remove elimina el grupo (204) e invalida catalogoCache', async () => {
        const invalidateSpy = vi.spyOn(catalogApi, 'invalidateCatalogoCache');
        await expect(searchSynonymsApi.remove(1)).resolves.toBeUndefined();
        expect(invalidateSpy).toHaveBeenCalledTimes(1);

        const remaining = await searchSynonymsApi.getAll();
        expect(remaining).toHaveLength(2);
    });
});
