import { describe, expect, it } from 'vitest';
import { ApiError, getErrorMessage } from './api-error';

describe('ApiError', () => {
    it('es una instancia de Error con status y data', () => {
        const error = new ApiError('Fallo', 500, { error: 'Fallo' });
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.name).toBe('ApiError');
        expect(error.status).toBe(500);
        expect(error.data).toEqual({ error: 'Fallo' });
        expect(error.message).toBe('Fallo');
    });

    it('usa defaults para data', () => {
        const error = new ApiError('Fallo', 400);
        expect(error.data).toEqual({});
    });
});

describe('getErrorMessage', () => {
    it('usa el fallback para null, undefined o no-objeto', () => {
        expect(getErrorMessage(null, 'fb')).toBe('fb');
        expect(getErrorMessage(undefined, 'fb')).toBe('fb');
        expect(getErrorMessage('texto', 'fb')).toBe('fb');
    });

    it('usa { error } si es string', () => {
        expect(getErrorMessage({ error: 'No autorizado' }, 'fb')).toBe('No autorizado');
    });

    it('usa { message } si es string', () => {
        expect(getErrorMessage({ message: 'Internal' }, 'fb')).toBe('Internal');
    });

    it('usa el primer valor string del objeto', () => {
        expect(getErrorMessage({ campo: 'Invalid', n: 1 }, 'fb')).toBe('Invalid');
    });

    it('usa el fallback cuando no hay strings', () => {
        expect(getErrorMessage({ n: 1 }, 'fb')).toBe('fb');
        expect(getErrorMessage({}, 'fb')).toBe('fb');
    });
});
