import { useState, useEffect, useCallback } from 'react';
import * as bannerApi from '../api/bannerApi';
import type { BannerApi, BannerSection } from '../types';

export interface UsePublicBannersReturn {
    banners: BannerApi[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function usePublicBanners(
    seccion: BannerSection = 'HERO_CAROUSEL'
): UsePublicBannersReturn {
    const [banners, setBanners] = useState<BannerApi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await bannerApi.listarVigentes(seccion);
            setBanners(data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al cargar banners';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [seccion]);

    useEffect(() => {
        void refetch();
    }, [refetch]);

    return {
        banners,
        isLoading,
        error,
        refetch,
    };
}
