import type { CatalogProduct, CatalogSortOrder } from '../model/types';

/**
 * Ordena productos del catálogo según el criterio activo (URL o default).
 */
export function sortCatalogProducts(
    productos: CatalogProduct[] | null | undefined,
    sort: CatalogSortOrder
): CatalogProduct[] {
    if (!productos) return [];
    const ordenados = [...productos];
    switch (sort) {
        case 'price-desc':
            return ordenados.sort((a, b) => (b.precioVenta || 0) - (a.precioVenta || 0));
        case 'name-asc':
            return ordenados.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        case 'name-desc':
            return ordenados.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
        case 'newest':
            return ordenados.sort((a, b) => {
                const fechaA = new Date(a.createdAt || a.updatedAt || 0).getTime();
                const fechaB = new Date(b.createdAt || b.updatedAt || 0).getTime();
                return fechaB - fechaA;
            });
        case 'price-asc':
        default:
            return ordenados.sort((a, b) => (a.precioVenta || 0) - (b.precioVenta || 0));
    }
}
