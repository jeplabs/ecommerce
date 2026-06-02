import type { AddressApi } from './schemas/api';
import type { AddressCardView } from './types';

export function mapAddressApiToCard(address: AddressApi): AddressCardView {
    return {
        id: address.id,
        alias: address.alias,
        linea1: address.direccion,
        linea2: [address.ciudad, address.estado, address.codigoPostal].filter(Boolean).join(', '),
        telefono: address.telefono,
        principal: address.principal,
        activo: address.activo,
    };
}

export function formatAddressOneLine(address: AddressApi): string {
    const parts = [
        address.direccion,
        address.ciudad,
        address.estado,
        address.codigoPostal,
        address.pais,
    ].filter(Boolean);
    return parts.join(', ');
}
