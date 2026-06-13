import type { ProfileTabId } from '@/app/providers';

export function getProfileTabFromPath(pathname: string): ProfileTabId {
    if (pathname.startsWith('/profile/direcciones')) {
        return 'direcciones';
    }
    if (pathname.startsWith('/profile/ordenes')) {
        return 'ordenes';
    }
    return 'datos';
}

export const PROFILE_TAB_PATHS: Record<ProfileTabId, string> = {
    datos: '/profile',
    direcciones: '/profile/direcciones',
    ordenes: '/profile/ordenes',
};

export function profileOrderDetailPath(orderId: number): string {
    return `/profile/ordenes/${orderId}`;
}
