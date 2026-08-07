import { describe, expect, it } from 'vitest';
import { getJwtExpiryMs } from './jwt-expiry';

function makeToken(payload: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(payload);
    return `${header}.${body}.signature`;
}

describe('getJwtExpiryMs', () => {
    it('devuelve exp en milisegundos para un token válido', () => {
        const token = makeToken('{"sub":"1","exp":1750000000}');
        expect(getJwtExpiryMs(token)).toBe(1750000000 * 1000);
    });

    it('devuelve null para token ausente o no string', () => {
        expect(getJwtExpiryMs(null)).toBeNull();
        expect(getJwtExpiryMs(undefined)).toBeNull();
        expect(getJwtExpiryMs(123 as unknown as string)).toBeNull();
    });

    it('devuelve null si el token no tiene 3 partes', () => {
        expect(getJwtExpiryMs('solo.dos')).toBeNull();
        expect(getJwtExpiryMs('a.b.c.d')).toBeNull();
    });

    it('devuelve null si el payload no tiene exp o no es número', () => {
        expect(getJwtExpiryMs(makeToken('{}'))).toBeNull();
        expect(getJwtExpiryMs(makeToken('{"exp":"soon"}'))).toBeNull();
    });

    it('devuelve null si el payload no es base64/JSON válido', () => {
        expect(getJwtExpiryMs('a.!!!.sig')).toBeNull();
    });
});
