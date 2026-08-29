export type FavoriteProduct = {
    productId: number;
    slug: string;
    nombre: string;
    precioVenta: number;
    moneda: string | null;
    imagenUrl: string | null;
    guardadoAt: string;
};

export type ToggleFavoriteResult =
    | { success: true; added: boolean }
    | { success: false; requiresAuth: true }
    | { success: false; error: string };
