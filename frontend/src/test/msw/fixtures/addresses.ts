import type { AddressApi } from '@/entities/address/model/schemas/api';

export const mockAddresses: AddressApi[] = [
    {
        id: 1,
        alias: 'Casa',
        direccion: 'Av. Principal 123',
        ciudad: 'Santiago',
        estado: 'RM',
        codigoPostal: '8320000',
        pais: 'CL',
        telefono: '+56912345678',
        referencias: 'Depto 4B',
        principal: true,
        activo: true,
    },
    {
        id: 2,
        alias: 'Oficina',
        direccion: 'Calle Secundaria 456',
        ciudad: 'Santiago',
        estado: 'RM',
        codigoPostal: '7500000',
        pais: 'CL',
        telefono: '+56987654321',
        referencias: null,
        principal: false,
        activo: true,
    },
];
