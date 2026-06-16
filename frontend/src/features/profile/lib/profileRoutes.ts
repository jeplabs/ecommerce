import type { ProfileTabId } from '@/app/providers';

export function getProfileTabFromPath(pathname: string): ProfileTabId {
    if (pathname.startsWith('/profile/direcciones')) {
        return 'direcciones';
    }
    if (pathname.startsWith('/profile/ordenes')) {
        return 'ordenes';
    }
    if (pathname.startsWith('/profile/favoritos')) {
        return 'favoritos';
    }
    return 'datos';
}

export const PROFILE_TAB_PATHS: Record<ProfileTabId, string> = {
    datos: '/profile',
    direcciones: '/profile/direcciones',
    ordenes: '/profile/ordenes',
    favoritos: '/profile/favoritos',
};

export function profileOrderDetailPath(orderId: number): string {
    return `/profile/ordenes/${orderId}`;
}

const ORDER_DETAIL_PATH = /^\/profile\/ordenes\/(\d+)$/;

export function getOrderIdFromProfilePath(pathname: string): number | null {
    const match = pathname.match(ORDER_DETAIL_PATH);
    if (!match) return null;

    const parsed = Number(match[1]);
    if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
        return null;
    }
    return parsed;
}

export function isProfilePath(pathname: string): boolean {
    if (pathname === '/profile') return true;
    if (pathname === '/profile/direcciones') return true;
    if (pathname === '/profile/ordenes') return true;
    if (pathname === '/profile/favoritos') return true;
    return ORDER_DETAIL_PATH.test(pathname);
}
