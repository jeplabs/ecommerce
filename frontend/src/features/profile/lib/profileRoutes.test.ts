import { describe, expect, it } from 'vitest';
import {
    getOrderIdFromProfilePath,
    getProfileTabFromPath,
    isProfilePath,
    profileOrderDetailPath,
    PROFILE_TAB_PATHS,
} from './profileRoutes';

describe('profileRoutes', () => {
    it('resuelve la pestaña activa según la ruta', () => {
        expect(getProfileTabFromPath('/profile')).toBe('datos');
        expect(getProfileTabFromPath('/profile/direcciones')).toBe('direcciones');
        expect(getProfileTabFromPath('/profile/ordenes')).toBe('ordenes');
        expect(getProfileTabFromPath('/profile/ordenes/42')).toBe('ordenes');
        expect(getProfileTabFromPath('/profile/favoritos')).toBe('favoritos');
    });

    it('genera rutas de pestañas y detalle de orden', () => {
        expect(PROFILE_TAB_PATHS.ordenes).toBe('/profile/ordenes');
        expect(profileOrderDetailPath(7)).toBe('/profile/ordenes/7');
    });

    it('extrae el id de orden del pathname', () => {
        expect(getOrderIdFromProfilePath('/profile/ordenes/12')).toBe(12);
        expect(getOrderIdFromProfilePath('/profile/ordenes')).toBeNull();
        expect(getOrderIdFromProfilePath('/profile/ordenes/abc')).toBeNull();
    });

    it('detecta rutas del perfil', () => {
        expect(isProfilePath('/profile')).toBe(true);
        expect(isProfilePath('/profile/ordenes/5')).toBe(true);
        expect(isProfilePath('/login')).toBe(false);
    });
});
