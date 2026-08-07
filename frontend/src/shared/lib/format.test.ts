import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDateTime, getInitials } from './format';

describe('formatCurrency', () => {
    it('formatea números a moneda es-MX', () => {
        const result = formatCurrency(1234.5);
        expect(result).not.toBe('—');
        expect(result).toMatch(/1,234/);
    });

    it('convierte strings numéricos', () => {
        expect(formatCurrency('500')).toMatch(/500/);
    });

    it('devuelve "—" para null, undefined y valores no numéricos', () => {
        expect(formatCurrency(null)).toBe('—');
        expect(formatCurrency(undefined)).toBe('—');
        expect(formatCurrency('abc')).toBe('—');
        expect(formatCurrency('')).toBe('—');
    });
});

describe('formatDateTime', () => {
    it('formatea una fecha ISO válida', () => {
        const result = formatDateTime('2026-05-20T10:00:00');
        expect(result).not.toBe('—');
        expect(result).toMatch(/2026/);
    });

    it('devuelve "—" para valores nulos o vacíos', () => {
        expect(formatDateTime(null)).toBe('—');
        expect(formatDateTime(undefined)).toBe('—');
        expect(formatDateTime('')).toBe('—');
    });
});

describe('getInitials', () => {
    it('combina iniciales en mayúsculas', () => {
        expect(getInitials('Juan', 'Perez')).toBe('JP');
        expect(getInitials('maria', 'lopez')).toBe('ML');
    });

    it('maneja apellido o nombre ausentes', () => {
        expect(getInitials('Ana', null)).toBe('A');
        expect(getInitials(null, 'García')).toBe('G');
    });

    it('devuelve "?" cuando no hay iniciales', () => {
        expect(getInitials(null, undefined)).toBe('?');
        expect(getInitials('', '')).toBe('?');
    });
});
