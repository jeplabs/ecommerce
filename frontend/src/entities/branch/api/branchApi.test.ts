import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { branchApi } from './branchApi';

describe('branchApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('retorna la lista de sucursales activas parsedas por Zod', async () => {
        const mockRaw = [
            {
                id: 1,
                nombre: 'Tienda Centro',
                direccion: 'Av. Principal 123, Ciudad de Guatemala',
                ciudad: 'Ciudad de Guatemala',
                estado: 'Guatemala',
                codigoPostal: '01001',
                pais: 'GT',
                telefono: '+502 2345-6789',
                horario: 'Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00',
                referencias: 'Zona 1, Centro Histórico',
                mapaUrl: null,
                activo: true,
                ordenVisualizacion: 1,
            },
        ];

        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => mockRaw,
        } as Response);

        const result = await branchApi.listar();
        expect(result).toHaveLength(1);
        expect(result[0].nombre).toBe('Tienda Centro');
        expect(result[0].horario).toBe('Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00');
    });

    it('lanza ApiError si el endpoint responde con error HTTP', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ mensaje: 'Error interno del servidor' }),
        } as Response);

        await expect(branchApi.listar()).rejects.toThrow('Error interno del servidor');
    });
});

