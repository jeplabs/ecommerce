import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { usePublicBanners } from './usePublicBanners';
import * as bannerApi from '../api/bannerApi';
import type { BannerApi } from '../types';

const mockBanners: BannerApi[] = [
    {
        id: 1,
        seccion: 'HERO_CAROUSEL',
        titulo: 'Banner Público 1',
        desktopUrl: 'https://test/1.png',
        mobileUrl: 'https://test/1-m.png',
        linkUrl: '/categoria/pc',
        orden: 1,
        activo: true,
        fechaInicio: null,
        fechaFin: null,
        createdAt: '2026-11-01T10:00:00',
        updatedAt: '2026-11-01T10:00:00',
    },
];

describe('usePublicBanners', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('obtiene los banners vigentes al inicializar', async () => {
        vi.spyOn(bannerApi, 'listarVigentes').mockResolvedValue(mockBanners);

        const { result } = renderHook(() => usePublicBanners('HERO_CAROUSEL'));

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.banners).toHaveLength(1);
        expect(result.current.banners[0]!.titulo).toBe('Banner Público 1');
        expect(result.current.error).toBeNull();
    });

    it('maneja errores de red gracefully sin romper la ejecución', async () => {
        vi.spyOn(bannerApi, 'listarVigentes').mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => usePublicBanners('HERO_CAROUSEL'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.banners).toEqual([]);
        expect(result.current.error).toBe('Network error');
    });
});
