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
