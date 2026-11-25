import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/app/providers';
import * as bannerApi from '../api/bannerApi';
import type {
    BannerApi,
    BannerSection,
    CreateBannerRequest,
    UpdateBannerRequest,
} from '../types';

export interface UseAdminBannersReturn {
    banners: BannerApi[];
    loading: boolean;
    error: string | null;
    saving: boolean;
    reordering: boolean;
    refetch: () => Promise<void>;
    createBanner: (datos: CreateBannerRequest) => Promise<boolean>;
    updateBanner: (id: number, datos: UpdateBannerRequest) => Promise<boolean>;
    toggleEstado: (id: number) => Promise<boolean>;
    moveUp: (index: number) => Promise<boolean>;
    moveDown: (index: number) => Promise<boolean>;
    deleteBanner: (id: number) => Promise<boolean>;
}

export function useAdminBanners(
    seccion: BannerSection = 'HERO_CAROUSEL'
): UseAdminBannersReturn {
    const { showSuccess, showError } = useToast();
    const [banners, setBanners] = useState<BannerApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [reordering, setReordering] = useState(false);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await bannerApi.listarAdmin(seccion);
            setBanners(data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al cargar banners';
            setError(msg);
            showError(msg);
        } finally {
            setLoading(false);
        }
    }, [seccion, showError]);

    useEffect(() => {
        void refetch();
    }, [refetch]);

    const createBanner = async (datos: CreateBannerRequest): Promise<boolean> => {
        setSaving(true);
        try {
            const created = await bannerApi.crearAdmin({ ...datos, seccion });
            setBanners((prev) => [...prev, created].sort((a, b) => a.orden - b.orden || a.id - b.id));
            showSuccess('Banner creado exitosamente');
            return true;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'No se pudo crear el banner';
            showError(msg);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const updateBanner = async (
        id: number,
        datos: UpdateBannerRequest
    ): Promise<boolean> => {
        setSaving(true);
        try {
            const updated = await bannerApi.actualizarAdmin(id, { ...datos, seccion });
            setBanners((prev) =>
                prev.map((b) => (b.id === id ? updated : b)).sort((a, b) => a.orden - b.orden || a.id - b.id)
            );
            showSuccess('Banner actualizado exitosamente');
            return true;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'No se pudo actualizar el banner';
            showError(msg);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const toggleEstado = async (id: number): Promise<boolean> => {
        // Optimistic UI
        const previousBanners = [...banners];
        setBanners((prev) =>
            prev.map((b) => (b.id === id ? { ...b, activo: !b.activo } : b))
        );

        try {
            const updated = await bannerApi.toggleEstadoAdmin(id);
            setBanners((prev) => prev.map((b) => (b.id === id ? updated : b)));
            showSuccess(
                updated.activo
                    ? 'Campaña activada correctamente'
                    : 'Campaña pausada correctamente'
            );
            return true;
        } catch (err) {
            setBanners(previousBanners);
            const msg = err instanceof Error ? err.message : 'No se pudo cambiar el estado del banner';
            showError(msg);
            return false;
        }
    };

    const reordenarLista = async (nuevosBanners: BannerApi[]): Promise<boolean> => {
        const previousBanners = [...banners];
        setBanners(nuevosBanners);
        setReordering(true);

        const bannerIds = nuevosBanners.map((b) => b.id);
        try {
            const reordered = await bannerApi.reordenarAdmin(bannerIds);
            setBanners(reordered);
            showSuccess('Orden actualizado');
            return true;
        } catch (err) {
            setBanners(previousBanners);
            const msg = err instanceof Error ? err.message : 'No se pudo actualizar el orden';
            showError(msg);
            return false;
        } finally {
            setReordering(false);
        }
    };

    const moveUp = async (index: number): Promise<boolean> => {
        if (index <= 0 || index >= banners.length || reordering) return false;
        const copy = [...banners];
        const temp = copy[index]!;
        copy[index] = copy[index - 1]!;
        copy[index - 1] = temp;

        return reordenarLista(copy);
    };

    const moveDown = async (index: number): Promise<boolean> => {
        if (index < 0 || index >= banners.length - 1 || reordering) return false;
        const copy = [...banners];
        const temp = copy[index]!;
        copy[index] = copy[index + 1]!;
        copy[index + 1] = temp;

        return reordenarLista(copy);
    };

    const deleteBanner = async (id: number): Promise<boolean> => {
        setSaving(true);
        try {
            await bannerApi.eliminarAdmin(id);
            setBanners((prev) => prev.filter((b) => b.id !== id));
            showSuccess('Banner eliminado definitivamente');
            return true;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'No se pudo eliminar el banner';
            showError(msg);
            return false;
        } finally {
            setSaving(false);
        }
    };

    return {
        banners,
        loading,
        error,
        saving,
        reordering,
        refetch,
        createBanner,
        updateBanner,
        toggleEstado,
        moveUp,
        moveDown,
        deleteBanner,
    };
}
