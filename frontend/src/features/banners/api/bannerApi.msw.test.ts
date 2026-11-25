import { describe, expect, it, beforeEach } from 'vitest';
import * as bannerApi from './bannerApi';
import { resetDynamicBanners } from '@/test/msw/fixtures/banners-registry';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';

describe('bannerApi — Integración con MSW', () => {
    beforeEach(() => {
        resetDynamicBanners();
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
    });

    it('listarVigentes: obtiene los banners activos y vigentes para HERO_CAROUSEL', async () => {
        const banners = await bannerApi.listarVigentes('HERO_CAROUSEL');
        expect(banners).toBeInstanceOf(Array);
        expect(banners.length).toBeGreaterThanOrEqual(2);
        expect(banners.every((b) => b.activo)).toBe(true);
    });

    it('listarAdmin: obtiene todos los banners incluyendo inactivos', async () => {
        const banners = await bannerApi.listarAdmin('HERO_CAROUSEL');
        expect(banners.length).toBeGreaterThanOrEqual(3);
        const inactivo = banners.find((b) => !b.activo);
        expect(inactivo).toBeDefined();
        expect(inactivo?.titulo).toBe('Campaña Navideña 2026');
    });

    it('crearAdmin: registra un nuevo banner y lo agrega a la lista', async () => {
        const nuevo = await bannerApi.crearAdmin({
            seccion: 'HERO_CAROUSEL',
            titulo: 'Nuevo Banner Test',
            desktopUrl: 'https://images.unsplash.com/photo-test?w=1920',
            mobileUrl: 'https://images.unsplash.com/photo-test?w=800',
            linkUrl: '/categoria/ofertas',
        });

        expect(nuevo.id).toBeDefined();
        expect(nuevo.titulo).toBe('Nuevo Banner Test');
        expect(nuevo.orden).toBe(4);

        const adminBanners = await bannerApi.listarAdmin('HERO_CAROUSEL');
        expect(adminBanners.some((b) => b.id === nuevo.id)).toBe(true);
    });

    it('toggleEstadoAdmin: alterna el estado activo/inactivo', async () => {
        const banner = await bannerApi.toggleEstadoAdmin(1);
        expect(banner.activo).toBe(false);

        const bannerRevertido = await bannerApi.toggleEstadoAdmin(1);
        expect(bannerRevertido.activo).toBe(true);
    });

    it('reordenarAdmin: actualiza las posiciones según los IDs enviados', async () => {
        const reordenados = await bannerApi.reordenarAdmin([2, 1, 3]);
        const banner2 = reordenados.find((b) => b.id === 2);
        const banner1 = reordenados.find((b) => b.id === 1);

        expect(banner2?.orden).toBe(1);
        expect(banner1?.orden).toBe(2);
    });

    it('eliminarAdmin: elimina un banner existente de la lista', async () => {
        await bannerApi.eliminarAdmin(1);
        const adminBanners = await bannerApi.listarAdmin('HERO_CAROUSEL');
        expect(adminBanners.some((b) => b.id === 1)).toBe(false);
    });
});
