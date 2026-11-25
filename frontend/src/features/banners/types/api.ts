import { z } from 'zod';
import { positiveIntSchema } from '@/utils';

export const bannerSectionSchema = z.enum([
    'HERO_CAROUSEL',
    'GRID_PROMO',
    'ANUNCIO_CINTILLO',
]);

export type BannerSection = z.infer<typeof bannerSectionSchema>;

export const bannerApiSchema = z.object({
    id: positiveIntSchema,
    seccion: bannerSectionSchema,
    titulo: z.string(),
    desktopUrl: z.string(),
    mobileUrl: z.string().nullable().optional(),
    linkUrl: z.string().nullable().optional(),
    orden: z.number().int().min(1),
    activo: z.boolean(),
    fechaInicio: z.string().nullable().optional(),
    fechaFin: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const bannerListSchema = z.array(bannerApiSchema);

export type BannerApi = z.infer<typeof bannerApiSchema>;

export interface CreateBannerRequest {
    seccion?: BannerSection;
    titulo: string;
    desktopUrl: string;
    mobileUrl?: string | null;
    linkUrl?: string | null;
    orden?: number | null;
    activo?: boolean;
    fechaInicio?: string | null;
    fechaFin?: string | null;
}

export type UpdateBannerRequest = CreateBannerRequest;

export interface ReorderBannersRequest {
    bannerIds: number[];
}
