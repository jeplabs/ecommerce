export type {
    AddressApi,
    CreateAddressRequest,
    UpdateAddressRequest,
    AddressFormValues,
    AddressCardView,
    AddressCheckoutView,
} from './model/types';

export {
    addressApiSchema,
    createAddressRequestSchema,
    updateAddressRequestSchema,
    addressFormSchema,
    mapAddressFormToCreateRequest,
    mapAddressFormToUpdateRequest,
} from './model/types';

export { mapAddressApiToCard, formatAddressOneLine } from './model/mappers';

export {
    addressApi,
    listar,
    crear,
    actualizar,
    cambiarPrincipal,
    eliminar,
} from './api';

export {
    useDireccionesLogic,
    type AddressActionResult,
} from './model/useDireccionesLogic';
