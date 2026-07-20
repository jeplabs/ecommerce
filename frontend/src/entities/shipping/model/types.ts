import type { ShippingServiceApi } from './schemas/api';

export type {
    ShippingServiceApi,
    ShippingOptionsApi,
    ShippingServiceCosts,
} from './schemas/api';
export type {
    ShippingOptionsQuery,
    ShippingPaymentFormValues,
} from './schemas/forms';

export {
    shippingServiceApiSchema,
    shippingOptionsApiSchema,
} from './schemas/api';
export {
    shippingOptionsQuerySchema,
    shippingPaymentFormSchema,
} from './schemas/forms';

export type ShippingServiceView = ShippingServiceApi & {
    isPickup: boolean;
};

export type ShippingOptionsView = {
    envioGratis: boolean;
    montoMinimoGratis: number | null;
    pickupServices: ShippingServiceView[];
    deliveryServices: ShippingServiceView[];
};

/** Estado normalizado de opciones de envío (hook + provider checkout). */
export type EnvioOpcionesState = {
    envioGratis: boolean;
    costoEnvio: number | null;
    montoMinimoGratis: number | null;
    servicios: ShippingServiceApi[];
    formaPagoEnvio: 'EN_LINEA' | 'CONTRA_ENTREGA';
};

export type UseEnvioOpcionesResult = {
    opciones: EnvioOpcionesState;
    servicios: ShippingServiceApi[];
    pickupServices: ShippingServiceApi[];
    deliveryServices: ShippingServiceApi[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    formaPagoEnvio: 'EN_LINEA' | 'CONTRA_ENTREGA';
    setFormaPagoEnvio: (fp: 'EN_LINEA' | 'CONTRA_ENTREGA') => void;
};
