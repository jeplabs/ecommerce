import { describe, expect, it } from 'vitest';
import { addressApi } from './addressApi';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';

function seedAuth() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
}

const nuevaDireccion = {
    alias: 'Depósito',
    direccion: 'Calle Nueva 789',
    ciudad: 'Valparaíso',
    estado: 'Valparaíso',
    codigoPostal: '2340000',
    pais: 'CL',
    telefono: '+56911112222',
    referencias: 'Portón azul',
    principal: false,
};

describe('addressApi', () => {
    it('listar devuelve direcciones mock', async () => {
        seedAuth();

        const direcciones = await addressApi.listar();

        expect(direcciones.length).toBeGreaterThanOrEqual(2);
        expect(direcciones.some((dir) => dir.principal)).toBe(true);
    });

    it('crear agrega una dirección', async () => {
        seedAuth();

        const created = await addressApi.crear(nuevaDireccion);

        expect(created.alias).toBe('Depósito');
        expect(created.id).toBeGreaterThan(0);
    });

    it('actualizar modifica una dirección existente', async () => {
        seedAuth();
        const created = await addressApi.crear(nuevaDireccion);

        const updated = await addressApi.actualizar(created.id, { alias: 'Bodega' });

        expect(updated.alias).toBe('Bodega');
    });

    it('cambiarPrincipal marca la dirección principal', async () => {
        seedAuth();
        const created = await addressApi.crear({ ...nuevaDireccion, alias: 'Secundaria' });

        const principal = await addressApi.cambiarPrincipal(created.id);

        expect(principal.principal).toBe(true);
    });

    it('eliminar quita la dirección', async () => {
        seedAuth();
        const created = await addressApi.crear(nuevaDireccion);

        await addressApi.eliminar(created.id);

        const direcciones = await addressApi.listar();
        expect(direcciones.some((dir) => dir.id === created.id)).toBe(false);
    });
});
