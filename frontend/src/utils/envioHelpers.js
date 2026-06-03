/** @deprecated Usar `@/entities/shipping` y `@/entities/order` (FORMA_PAGO_ENVIO). */
export {
    isPickupService,
    getShippingServiceCosts,
    getServicioCostos,
    resolveShippingCost,
    resolveShippingCostInTotal,
    partitionShippingServices,
} from '@/entities/shipping';

export { FORMA_PAGO_ENVIO } from '@/entities/order';
