import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { branchApi } from './branchApi';
import type { BranchApi } from '../model/schemas/api';

describe('branchApi (admin)', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const mockBranch: BranchApi = {
        id: 1,
        nombre: 'Tienda Centro',
        direccion: 'Av. Principal 123, Ciudad de Guatemala',
        ciudad: 'Ciudad de Guatemala',
        estado: 'Guatemala',
        codigoPostal: '01001',
        pais: 'GT',
        telefono: '+502 2345-6789',
        horario: 'Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00',
        referencias: 'Zona 1',
        mapaUrl: null,
        activo: true,
        ordenVisualizacion: 1,
    };

    it('listarAdmin retorna todas las sucursales', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => [mockBranch],
        } as Response);

        const data = await branchApi.listarAdmin();
        expect(data).toHaveLength(1);
        expect(data[0].id).toBe(1);
    });

    it('obtenerAdmin obtiene una sucursal por ID', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => mockBranch,
        } as Response);

        const data = await branchApi.obtenerAdmin(1);
        expect(data.nombre).toBe('Tienda Centro');
    });

    it('crearAdmin envía POST y retorna la sucursal creada', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => ({ ...mockBranch, id: 3, nombre: 'Nueva Sucursal' }),
        } as Response);

        const data = await branchApi.crearAdmin({
            nombre: 'Nueva Sucursal',
            direccion: 'Calle 1',
            ciudad: 'Guatemala',
            pais: 'GT',
            telefono: '12345678',
            horario: '9:00-18:00',
        });
        expect(data.id).toBe(3);
        expect(data.nombre).toBe('Nueva Sucursal');
    });

    it('actualizarAdmin envía PATCH y retorna la sucursal modificada', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => ({ ...mockBranch, nombre: 'Nombre Actualizado' }),
        } as Response);

        const data = await branchApi.actualizarAdmin(1, { nombre: 'Nombre Actualizado' });
        expect(data.nombre).toBe('Nombre Actualizado');
    });

    it('activarAdmin envía PATCH /activar y resuelve void en 204', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 204,
        } as Response);

        await expect(branchApi.activarAdmin(1)).resolves.toBeUndefined();
    });

    it('desactivarAdmin envía DELETE y resuelve void en 204', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 204,
        } as Response);

        await expect(branchApi.desactivarAdmin(1)).resolves.toBeUndefined();
    });
});

