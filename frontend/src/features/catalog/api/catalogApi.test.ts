import { describe, expect, it, beforeEach } from 'vitest';
import { getCatalogo, invalidateCatalogoCache } from './catalogApi';
import { mockProduct } from '@/test/msw/fixtures/products';

describe('catalogApi', () => {
    beforeEach(() => {
        invalidateCatalogoCache();
    });

    it('getCatalogo devuelve la página con productos y facetas', async () => {
        const page = await getCatalogo();

        expect(page.content.length).toBeGreaterThan(0);
        expect(page.totalElements).toBeGreaterThan(0);
        expect(page.content.some((p) => p.slug === mockProduct.slug)).toBe(true);
    });

    it('getCatalogo usa caché para la misma query y forceFresh la ignora', async () => {
        const first = await getCatalogo('page=0&size=10');
        const second = await getCatalogo('page=0&size=10');
        expect(second).toBe(first);

        const fresh = await getCatalogo('page=0&size=10', { forceFresh: true });
        expect(fresh).not.toBe(first);
        expect(fresh.content.length).toBe(first.content.length);
    });

    it('invalidateCatalogoCache limpia la caché', async () => {
        const first = await getCatalogo();
        invalidateCatalogoCache();
        const afterClear = await getCatalogo();
        expect(afterClear).not.toBe(first);
    });
});
