/** Snapshot local hasta integrar GET /api/favoritos. */
export type FavoriteProduct = {
    productId: number;
    slug: string;
    nombre: string;
    precioVenta: number;
    moneda: string;
    imagenUrl: string | null;
    guardadoAt: string;
};

export type ToggleFavoriteResult =
    | { success: true; added: boolean }
    | { success: false; requiresAuth: true };
