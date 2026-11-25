import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useAdminBanners } from './useAdminBanners';
import * as bannerApi from '../api/bannerApi';
import type { BannerApi } from '../types';

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock('@/app/providers', () => ({
    useToast: () => ({
        showSuccess: mockShowSuccess,
        showError: mockShowError,
    }),
}));

const mockBanners: BannerApi[] = [
    {
        id: 1,
        seccion: 'HERO_CAROUSEL',
        titulo: 'Banner 1',
        desktopUrl: 'https://test/1.png',
        mobileUrl: null,
        linkUrl: null,
        orden: 1,
        activo: true,
        fechaInicio: null,
        fechaFin: null,
        createdAt: '2026-11-01T10:00:00',
        updatedAt: '2026-11-01T10:00:00',
    },
    {
        id: 2,
        seccion: 'HERO_CAROUSEL',
        titulo: 'Banner 2',
        desktopUrl: 'https://test/2.png',
        mobileUrl: null,
        linkUrl: null,
        orden: 2,
        activo: false,
        fechaInicio: null,
        fechaFin: null,
        createdAt: '2026-11-02T10:00:00',
        updatedAt: '2026-11-02T10:00:00',
    },
];

describe('useAdminBanners', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(bannerApi, 'listarAdmin').mockResolvedValue([...mockBanners]);
    });

    it('carga los banners al inicializar', async () => {
        const { result } = renderHook(() => useAdminBanners('HERO_CAROUSEL'));

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.banners).toHaveLength(2);
        expect(result.current.error).toBeNull();
    });

    it('crea un banner y lo agrega a la lista', async () => {
        const nuevo: BannerApi = {
            id: 3,
            seccion: 'HERO_CAROUSEL',
            titulo: 'Nuevo Banner',
            desktopUrl: 'https://test/3.png',
            mobileUrl: null,
            linkUrl: null,
            orden: 3,
            activo: true,
            fechaInicio: null,
            fechaFin: null,
            createdAt: '2026-11-03T10:00:00',
            updatedAt: '2026-11-03T10:00:00',
        };

        vi.spyOn(bannerApi, 'crearAdmin').mockResolvedValue(nuevo);

        const { result } = renderHook(() => useAdminBanners('HERO_CAROUSEL'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let success: boolean = false;
        await act(async () => {
            success = await result.current.createBanner({
                titulo: 'Nuevo Banner',
                desktopUrl: 'https://test/3.png',
            });
        });

        expect(success).toBe(true);
        expect(result.current.banners).toHaveLength(3);
        expect(mockShowSuccess).toHaveBeenCalledWith('Banner creado exitosamente');
    });

    it('alterna el estado activo de un banner', async () => {
        const bannerActualizado: BannerApi = {
            ...mockBanners[0]!,
            activo: false,
        };

        vi.spyOn(bannerApi, 'toggleEstadoAdmin').mockResolvedValue(bannerActualizado);

        const { result } = renderHook(() => useAdminBanners('HERO_CAROUSEL'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let success = false;
        await act(async () => {
            success = await result.current.toggleEstado(1);
        });

        expect(success).toBe(true);
        expect(result.current.banners.find((b) => b.id === 1)?.activo).toBe(false);
        expect(mockShowSuccess).toHaveBeenCalledWith('Campaña pausada correctamente');
    });

    it('reordena hacia arriba (moveUp) con actualización optimista', async () => {
        vi.spyOn(bannerApi, 'reordenarAdmin').mockResolvedValue([
            { ...mockBanners[1]!, orden: 1 },
            { ...mockBanners[0]!, orden: 2 },
        ]);

        const { result } = renderHook(() => useAdminBanners('HERO_CAROUSEL'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let success = false;
        await act(async () => {
            // Mover el segundo elemento (index 1) a la primera posición
            success = await result.current.moveUp(1);
        });

        expect(success).toBe(true);
        expect(result.current.banners[0]!.id).toBe(2);
        expect(result.current.banners[1]!.id).toBe(1);
        expect(mockShowSuccess).toHaveBeenCalledWith('Orden actualizado');
    });

    it('elimina un banner de la lista', async () => {
        vi.spyOn(bannerApi, 'eliminarAdmin').mockResolvedValue();

        const { result } = renderHook(() => useAdminBanners('HERO_CAROUSEL'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let success = false;
        await act(async () => {
            success = await result.current.deleteBanner(1);
        });

        expect(success).toBe(true);
        expect(result.current.banners).toHaveLength(1);
        expect(result.current.banners.some((b) => b.id === 1)).toBe(false);
        expect(mockShowSuccess).toHaveBeenCalledWith('Banner eliminado definitivamente');
    });
});
