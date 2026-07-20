import { createSpringPageSchema } from '@/shared/api/spring-page';
import type { OrderApi } from './schemas/api';
import { orderApiSchema } from './schemas/api';

export type {
    OrderApi,
    OrderItemApi,
    OrderShippingAddressApi,
    OrderStatus,
    FormaPago,
} from './schemas/api';
export type {
    CreateOrderRequest,
    UpdateOrderStatusRequest,
    CheckoutOrderFormValues,
} from './schemas/forms';

export {
    orderStatusSchema,
    formaPagoSchema,
    tipoMetodoPagoSchema,
    metodoPagoSchema,
    orderApiSchema,
    orderItemApiSchema,
    orderShippingAddressApiSchema,
} from './schemas/api';
export {
    createOrderRequestSchema,
    updateOrderStatusRequestSchema,
    checkoutOrderFormSchema,
    formaPagoEnvioSchema,
    mapCheckoutFormToCreateOrderRequest,
} from './schemas/forms';

export const orderPageSchema = createSpringPageSchema(orderApiSchema);

export type OrderPage = import('@/shared/api/spring-page').SpringPage<OrderApi>;

export type OrderSummaryCardView = {
    id: number;
    estado: OrderApi['estado'];
    total: number;
    itemsCount: number;
    creadoAt: string;
    servicioEnvio: string | null;
};

export type OrderDetailView = OrderApi;

export type OrderListFilters = {
    estado?: OrderApi['estado'];
    page?: number;
    size?: number;
};
