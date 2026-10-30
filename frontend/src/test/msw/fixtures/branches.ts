import type { BranchApi } from '@/entities/branch';

export const mockBranches: BranchApi[] = [
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
        creadoAt: '2026-10-29T15:00:00',
        actualizadoAt: '2026-10-29T15:00:00',
    },
    {
        id: 2,
        nombre: 'Tienda Zona 10',
        direccion: 'Boulevard Los Proceres 5-50, Zona 10',
        ciudad: 'Ciudad de Guatemala',
        estado: 'Guatemala',
        codigoPostal: '01010',
        pais: 'GT',
        telefono: '+502 2456-7890',
        horario: 'Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00',
        referencias: 'Plaza Comercial Zona 10',
        mapaUrl: null,
        activo: true,
        ordenVisualizacion: 2,
        creadoAt: '2026-10-29T15:00:00',
        actualizadoAt: '2026-10-29T15:00:00',
    },
];

