import type { BannerApi, BannerSection, CreateBannerRequest, UpdateBannerRequest } from '@/features/banners';
import { mockBanners as seedBanners } from './banners';

let banners: BannerApi[] = [];
let nextId = 10;

export function resetDynamicBanners() {
    banners = seedBanners.map((banner) => ({ ...banner }));
    nextId = 10;
}

resetDynamicBanners();

export function getDynamicBanners(soloVigentes = false, seccion?: BannerSection): BannerApi[] {
    const now = new Date();
    let list = banners;

    if (seccion) {
        list = list.filter((b) => b.seccion === seccion);
    }

    if (soloVigentes) {
        list = list.filter((b) => {
            if (!b.activo) return false;
            if (b.fechaInicio && new Date(b.fechaInicio) > now) return false;
            if (b.fechaFin && new Date(b.fechaFin) < now) return false;
            return true;
        });
    }

    return [...list].sort((a, b) => a.orden - b.orden || a.id - b.id);
}

export function findDynamicBanner(id: number): BannerApi | undefined {
    return banners.find((b) => b.id === id);
}

export function createDynamicBanner(data: CreateBannerRequest): BannerApi {
    const seccion = data.seccion ?? 'HERO_CAROUSEL';
    const now = '2026-11-25T12:00:00';

    const calculatedOrden =
        data.orden != null
            ? data.orden
            : Math.max(0, ...banners.filter((b) => b.seccion === seccion).map((b) => b.orden)) + 1;

    const created: BannerApi = {
        id: nextId++,
        seccion,
        titulo: data.titulo,
        desktopUrl: data.desktopUrl,
        mobileUrl: data.mobileUrl ?? null,
        linkUrl: data.linkUrl ?? null,
        orden: calculatedOrden,
        activo: data.activo ?? true,
        fechaInicio: data.fechaInicio ?? null,
        fechaFin: data.fechaFin ?? null,
        createdAt: now,
        updatedAt: now,
    };

    banners.push(created);
    return { ...created };
}

export function updateDynamicBanner(id: number, data: UpdateBannerRequest): BannerApi {
    const index = banners.findIndex((b) => b.id === id);
    if (index === -1) {
        throw new Error('Banner no encontrado');
    }

    const current = banners[index]!;
    const now = '2026-11-25T12:00:00';

    const updated: BannerApi = {
        ...current,
        seccion: data.seccion ?? current.seccion,
        titulo: data.titulo,
        desktopUrl: data.desktopUrl,
        mobileUrl: data.mobileUrl ?? null,
        linkUrl: data.linkUrl ?? null,
        orden: data.orden != null ? data.orden : current.orden,
        activo: data.activo != null ? data.activo : current.activo,
        fechaInicio: data.fechaInicio ?? null,
        fechaFin: data.fechaFin ?? null,
        updatedAt: now,
    };

    banners[index] = updated;
    return { ...updated };
}

export function toggleActivoDynamicBanner(id: number): BannerApi {
    const banner = findDynamicBanner(id);
    if (!banner) {
        throw new Error('Banner no encontrado');
    }

    banner.activo = !banner.activo;
    banner.updatedAt = '2026-11-25T12:00:00';
    return { ...banner };
}

export function reorderDynamicBanners(bannerIds: number[]): BannerApi[] {
    bannerIds.forEach((id, index) => {
        const banner = findDynamicBanner(id);
        if (banner) {
            banner.orden = index + 1;
            banner.updatedAt = '2026-11-25T12:00:00';
        }
    });

    return getDynamicBanners(false);
}

export function deleteDynamicBanner(id: number): void {
    const index = banners.findIndex((b) => b.id === id);
    if (index === -1) {
        throw new Error('Banner no encontrado');
    }
    banners.splice(index, 1);
}
