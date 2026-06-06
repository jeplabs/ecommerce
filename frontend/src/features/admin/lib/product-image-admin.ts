/**
 * Helpers para edición admin de imágenes de producto (IDs de UI vs IDs de BD).
 */

export type AdminImageApiSource =
    | string
    | {
          id?: number;
          url?: string;
          imagenUrl?: string;
          urlImagen?: string;
          src?: string;
          principal?: boolean;
      };

export type AdminProductFormImage = {
    id: string;
    backendId: number | null;
    type: 'url';
    url: string;
    file: null;
    preview: string;
    principal: boolean;
    persisted: boolean;
};

export type AdminAddedImageRef = {
    id?: number;
    url?: string;
};

export function createClientImageId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function clientIdFromBackendId(backendId: number): string {
    return `db-${backendId}`;
}

export function isBackendImageId(id: unknown): boolean {
    if (id == null || id === '') return false;
    const n = Number(id);
    return Number.isInteger(n) && n > 0 && n < 1_000_000_000;
}

export function getImageUrl(img: AdminImageApiSource | null | undefined): string | null {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.url || img.imagenUrl || img.urlImagen || img.src || null;
}

export function getInitialPrincipalBackendId(images: AdminImageApiSource[] = []): number | null {
    for (const img of images) {
        if (typeof img === 'string') continue;
        if (img?.principal && img?.id != null && isBackendImageId(img.id)) {
            return Number(img.id);
        }
    }
    return null;
}

export function resolvePrincipalBackendId(
    formImages: AdminProductFormImage[],
    principalClientId: string | null | undefined,
    addedImages: AdminAddedImageRef[] = []
): number | null {
    if (!Array.isArray(formImages) || formImages.length === 0) return null;

    const principal =
        formImages.find((img) => img.id === principalClientId) ||
        formImages.find((img) => img.principal);

    if (!principal) return null;

    if (principal.backendId != null && isBackendImageId(principal.backendId)) {
        return Number(principal.backendId);
    }

    if (isBackendImageId(principal.id)) {
        return Number(principal.id);
    }

    const url = principal.url;
    if (url && Array.isArray(addedImages)) {
        const match = addedImages.find((db) => db.url === url);
        if (match?.id != null) return Number(match.id);
    }

    return null;
}

export function normalizeApiImageToForm(
    img: AdminImageApiSource,
    _index?: number
): AdminProductFormImage {
    const normalized = typeof img === 'string' ? { url: img, principal: false } : img;
    const backendId = normalized?.id ?? null;
    const resolvedUrl = getImageUrl(normalized) || '';

    return {
        id: backendId != null ? clientIdFromBackendId(backendId) : createClientImageId(),
        backendId,
        type: 'url',
        url: resolvedUrl,
        file: null,
        preview: resolvedUrl,
        principal: Boolean(normalized?.principal),
        persisted: backendId != null && typeof img !== 'string',
    };
}
