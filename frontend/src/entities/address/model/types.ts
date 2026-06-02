import type { AddressApi } from './schemas/api';

export type { AddressApi } from './schemas/api';
export type {
    CreateAddressRequest,
    UpdateAddressRequest,
    AddressFormValues,
} from './schemas/forms';

export { addressApiSchema } from './schemas/api';
export {
    createAddressRequestSchema,
    updateAddressRequestSchema,
    addressFormSchema,
    mapAddressFormToCreateRequest,
} from './schemas/forms';

export type AddressCardView = {
    id: number;
    alias: string;
    linea1: string;
    linea2: string;
    telefono: string;
    principal: boolean;
    activo: boolean;
};

export type AddressCheckoutView = AddressApi;
