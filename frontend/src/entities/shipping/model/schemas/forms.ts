import { z } from 'zod';
import { formaPagoSchema } from '@/entities/order/model/schemas/api';

/** Query GET /api/envio/opciones?subtotal= */
export const shippingOptionsQuerySchema = z.object({
    subtotal: z.coerce.number().nonnegative().default(0),
});

export type ShippingOptionsQuery = z.infer<typeof shippingOptionsQuerySchema>;

/** Selección de forma de pago del envío en checkout UI. */
export const shippingPaymentFormSchema = z.object({
    formaPagoEnvio: formaPagoSchema,
    servicioEnvioId: z.number().int().positive(),
});

export type ShippingPaymentFormValues = z.infer<typeof shippingPaymentFormSchema>;
