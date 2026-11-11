import { describe, expect, it } from 'vitest';
import {
    clientIdFromBackendId,
    createClientImageId,
    getImageUrl,
    getInitialPrincipalBackendId,
    isBackendImageId,
    normalizeApiImageToForm,
    resolvePrincipalBackendId,
} from './product-image-admin';

describe('product-image-admin', () => {
    it('isBackendImageId valida enteros positivos menores a mil millones', () => {
        expect(isBackendImageId(1)).toBe(true);
        expect(isBackendImageId('42')).toBe(true);
        expect(isBackendImageId(0)).toBe(false);
        expect(isBackendImageId(-5)).toBe(false);
        expect(isBackendImageId(1_000_000_000)).toBe(false);
        expect(isBackendImageId('client-123')).toBe(false);
        expect(isBackendImageId(null)).toBe(false);
    });

    it('getImageUrl extrae url desde string u objeto con distintas propiedades', () => {
        expect(getImageUrl('https://cdn.test/a.jpg')).toBe('https://cdn.test/a.jpg');
        expect(getImageUrl({ url: 'https://cdn.test/u.jpg' })).toBe('https://cdn.test/u.jpg');
        expect(getImageUrl({ imagenUrl: 'https://cdn.test/i.jpg' })).toBe('https://cdn.test/i.jpg');
        expect(getImageUrl({ urlImagen: 'https://cdn.test/ui.jpg' })).toBe('https://cdn.test/ui.jpg');
        expect(getImageUrl({ src: 'https://cdn.test/s.jpg' })).toBe('https://cdn.test/s.jpg');
        expect(getImageUrl(null)).toBeNull();
    });

    it('getInitialPrincipalBackendId retorna el id de la imagen marcada principal', () => {
        expect(
            getInitialPrincipalBackendId([
                'https://cdn.test/a.jpg',
                { id: 10, url: 'https://cdn.test/b.jpg', principal: false },
                { id: 25, url: 'https://cdn.test/c.jpg', principal: true },
            ])
        ).toBe(25);
        expect(getInitialPrincipalBackendId([])).toBeNull();
    });

    it('normalizeApiImageToForm normaliza string y objeto persistido', () => {
        const persisted = normalizeApiImageToForm({
            id: 7,
            url: 'https://cdn.test/7.jpg',
            principal: true,
        });
        expect(persisted).toMatchObject({
            id: clientIdFromBackendId(7),
            backendId: 7,
            url: 'https://cdn.test/7.jpg',
            principal: true,
            persisted: true,
        });

        const fresh = normalizeApiImageToForm('https://cdn.test/raw.jpg');
        expect(fresh.id.startsWith('client-')).toBe(true);
        expect(fresh.backendId).toBeNull();
        expect(fresh.persisted).toBe(false);
        expect(createClientImageId()).toMatch(/^client-/);
    });

    it('resolvePrincipalBackendId resuelve por backendId, id numérico o url en addedImages', () => {
        const existing = normalizeApiImageToForm({
            id: 12,
            url: 'https://cdn.test/12.jpg',
            principal: true,
        });
        expect(resolvePrincipalBackendId([existing], existing.id)).toBe(12);

        const newImg = normalizeApiImageToForm('https://cdn.test/new.jpg');
        newImg.principal = true;
        expect(
            resolvePrincipalBackendId([newImg], newImg.id, [
                { id: 99, url: 'https://cdn.test/new.jpg' },
            ])
        ).toBe(99);

        expect(resolvePrincipalBackendId([], null)).toBeNull();
    });
});
