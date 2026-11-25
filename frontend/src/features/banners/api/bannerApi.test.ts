import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import * as bannerApi from './bannerApi';
import type { BannerApi } from '../types';

const mockBanner: BannerApi = {
    id: 1,
    seccion: 'HERO_CAROUSEL',
    titulo: 'Cyber Monday 2026',
    desktopUrl: 'https://res.cloudinary.com/demo/image/upload/desktop.webp',
    mobileUrl: 'https://res.cloudinary.com/demo/image/upload/mobile.webp',
    linkUrl: '/categoria/ofertas',
    orden: 1,
    activo: true,
    fechaInicio: '2026-11-01T00:00:00',
    fechaFin: '2026-11-30T23:59:59',
    createdAt: '2026-11-01T10:00:00',
    updatedAt: '2026-11-01T10:00:00',
};

describe('bannerApi', () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
        localStorage.setItem('token', 'test-token');
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    it('listarVigentes: envía GET a /api/banners con query param y devuelve la lista parseada', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [mockBanner],
        });

        const result = await bannerApi.listarVigentes('HERO_CAROUSEL');

        expect(globalThis.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/banners?seccion=HERO_CAROUSEL'),
            expect.objectContaining({ method: 'GET' })
        );
        expect(result).toHaveLength(1);
        expect(result[0]!.titulo).toBe('Cyber Monday 2026');
    });

    it('listarAdmin: envía GET a /api/banners/admin con cabecera de autenticación', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [mockBanner],
        });

        const result = await bannerApi.listarAdmin('HERO_CAROUSEL');

        expect(globalThis.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/banners/admin?seccion=HERO_CAROUSEL'),
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    Authorization: 'Bearer test-token',
                }),
            })
        );
        expect(result).toHaveLength(1);
    });

    it('crearAdmin: envía POST a /api/banners con el body correspondiente', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 201,
            json: async () => mockBanner,
        });

        const payload = {
            seccion: 'HERO_CAROUSEL' as const,
            titulo: 'Nuevo Banner',
            desktopUrl: 'https://res.cloudinary.com/demo/image/upload/new.webp',
        };

        const result = await bannerApi.crearAdmin(payload);

        expect(globalThis.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/banners'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(payload),
            })
        );
        expect(result.id).toBe(1);
    });

    it('actualizarAdmin: envía PUT a /api/banners/{id}', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ ...mockBanner, titulo: 'Actualizado' }),
        });

        const payload = {
            titulo: 'Actualizado',
            desktopUrl: 'https://res.cloudinary.com/demo/image/upload/updated.webp',
        };

        const result = await bannerApi.actualizarAdmin(1, payload);

        expect(globalThis.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/banners/1'),
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify(payload),
            })
        );
        expect(result.titulo).toBe('Actualizado');
    });

    it('toggleEstadoAdmin: envía PATCH a /api/banners/{id}/estado', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ ...mockBanner, activo: false }),
        });

        const result = await bannerApi.toggleEstadoAdmin(1);

        expect(globalThis.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/banners/1/estado'),
            expect.objectContaining({ method: 'PATCH' })
        );
        expect(result.activo).toBe(false);
    });

    it('reordenarAdmin: envía PUT a /api/banners/reordenar con el listado de ids', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [mockBanner],
        });

        const result = await bannerApi.reordenarAdmin([2, 1, 3]);

        expect(globalThis.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/banners/reordenar'),
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({ bannerIds: [2, 1, 3] }),
            })
        );
        expect(result).toHaveLength(1);
    });

    it('eliminarAdmin: envía DELETE a /api/banners/{id} y resuelve sin contenido', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 204,
        });

        await expect(bannerApi.eliminarAdmin(1)).resolves.toBeUndefined();

        expect(globalThis.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/banners/1'),
            expect.objectContaining({ method: 'DELETE' })
        );
    });

    it('lanza ApiError con el mensaje del backend si la respuesta no es ok', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ mensaje: 'Datos de banner inválidos' }),
        });

        await expect(
            bannerApi.crearAdmin({
                titulo: '',
                desktopUrl: '',
            })
        ).rejects.toThrow('Datos de banner inválidos');
    });
});
