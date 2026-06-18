import type { AddressApi } from '@/entities/address/model/schemas/api';
import { mockAddresses as seedAddresses } from './addresses';

let addresses: AddressApi[] = [];
let nextId = 10;

export function resetDynamicAddresses() {
    addresses = seedAddresses.map((address) => ({ ...address }));
    nextId = 10;
}

export function getDynamicAddresses(): AddressApi[] {
    return addresses.map((address) => ({ ...address }));
}

export function findDynamicAddress(id: number): AddressApi | undefined {
    return addresses.find((address) => address.id === id);
}

export function createDynamicAddress(
    data: Omit<AddressApi, 'id'>
): AddressApi {
    if (data.principal) {
        addresses = addresses.map((address) => ({ ...address, principal: false }));
    }

    const created: AddressApi = {
        activo: true,
        principal: false,
        referencias: null,
        codigoPostal: null,
        ...data,
        id: nextId++,
    };
    addresses.push(created);
    return { ...created };
}

export function updateDynamicAddress(
    id: number,
    data: Partial<Omit<AddressApi, 'id'>>
): AddressApi {
    const index = addresses.findIndex((address) => address.id === id);
    if (index === -1) {
        throw new Error('Dirección no encontrada');
    }

    const updated = { ...addresses[index], ...data, id };
    addresses[index] = updated;
    return { ...updated };
}

export function setDynamicPrincipal(id: number): AddressApi {
    addresses = addresses.map((address) => ({
        ...address,
        principal: address.id === id,
    }));

    const principal = findDynamicAddress(id);
    if (!principal) {
        throw new Error('Dirección no encontrada');
    }

    return { ...principal };
}

export function deleteDynamicAddress(id: number): void {
    const exists = addresses.some((address) => address.id === id);
    if (!exists) {
        throw new Error('Dirección no encontrada');
    }

    addresses = addresses.filter((address) => address.id !== id);
}
