/**
 * Helpers para edición admin de imágenes de producto (IDs de UI vs IDs de BD).
 */

export function createClientImageId() {
    return `client-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function clientIdFromBackendId(backendId) {
    return `db-${backendId}`;
}

/** ID numérico de BD (no timestamp del formulario). */
export function isBackendImageId(id) {
    if (id == null || id === '') return false;
    const n = Number(id);
    return Number.isInteger(n) && n > 0 && n < 1_000_000_000;
}

export function getImageUrl(img) {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.url || img.imagenUrl || img.urlImagen || img.src || null;
}

export function getInitialPrincipalBackendId(images = []) {
    for (const img of images) {
        if (typeof img === 'string') continue;
        if (img?.principal && img?.id != null && isBackendImageId(img.id)) {
            return Number(img.id);
        }
    }
    return null;
}

/**
 * Resuelve el ID de BD de la imagen principal a partir del estado del formulario.
 * @param {Array} formImages
 * @param {string|number|null} principalClientId - id de UI (`db-5` o `client-...`)
 * @param {Array<{ id: number, url: string }>} [addedImages] - respuesta de POST /imagenes
 */
export function resolvePrincipalBackendId(formImages, principalClientId, addedImages = []) {
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

    const url = getImageUrl(principal);
    if (url && Array.isArray(addedImages)) {
        const match = addedImages.find((db) => db.url === url);
        if (match?.id != null) return Number(match.id);
    }

    return null;
}

export function normalizeApiImageToForm(img, index) {
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
