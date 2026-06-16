import type { FavoriteProduct } from '../model/types';

const STORAGE_PREFIX = 'ecommerce:favoritos:v1';

function getJwtSubject(token: string | null): string | null {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        const payload = JSON.parse(atob(padded)) as { sub?: string };
        return typeof payload.sub === 'string' && payload.sub ? payload.sub : null;
    } catch {
        return null;
    }
}

/** Clave por usuario (JWT sub) para migrar fácil al backend. */
export function getFavoritesStorageKey(): string {
    const subject = getJwtSubject(localStorage.getItem('token'));
    return subject ? `${STORAGE_PREFIX}:${subject}` : `${STORAGE_PREFIX}:guest`;
}

function readFavorites(): FavoriteProduct[] {
    try {
        const raw = localStorage.getItem(getFavoritesStorageKey());
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (item): item is FavoriteProduct =>
                typeof item === 'object' &&
                item != null &&
                typeof (item as FavoriteProduct).productId === 'number' &&
                typeof (item as FavoriteProduct).slug === 'string' &&
                typeof (item as FavoriteProduct).nombre === 'string'
        );
    } catch {
        return [];
    }
}

function writeFavorites(items: FavoriteProduct[]) {
    localStorage.setItem(getFavoritesStorageKey(), JSON.stringify(items));
}

export function listFavorites(): FavoriteProduct[] {
    return readFavorites().sort(
        (a, b) => new Date(b.guardadoAt).getTime() - new Date(a.guardadoAt).getTime()
    );
}

export function isFavoriteProduct(productId: number): boolean {
    return readFavorites().some((item) => item.productId === productId);
}

export function saveFavorite(item: FavoriteProduct): void {
    const items = readFavorites().filter((fav) => fav.productId !== item.productId);
    writeFavorites([{ ...item, guardadoAt: new Date().toISOString() }, ...items]);
}

export function removeFavorite(productId: number): void {
    writeFavorites(readFavorites().filter((item) => item.productId !== productId));
}

/** @returns true si quedó agregado, false si se eliminó */
export function toggleFavoriteStorage(item: FavoriteProduct): boolean {
    if (isFavoriteProduct(item.productId)) {
        removeFavorite(item.productId);
        return false;
    }
    saveFavorite(item);
    return true;
}
