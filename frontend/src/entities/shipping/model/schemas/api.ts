import { z } from 'zod';
import { moneySchema, positiveIntSchema } from '@/shared/lib/zod-helpers';

/** {@code DatosRespuestaServicioEnvio}. */
export const shippingServiceApiSchema = z.object({
    id: positiveIntSchema,
    nombre: z.string(),
    descripcion: z.string().nullable().optional(),
    tarifa: moneySchema,
    recargoContraEntrega: moneySchema,
    costoEnLinea: moneySchema,
    costoContraEntrega: moneySchema,
    logoUrl: z.string().nullable().optional(),
});

/** {@code DatosRespuestaOpcionesEnvio}. */
export const shippingOptionsApiSchema = z.object({
    envioGratis: z.boolean(),
    costoEnvio: moneySchema.nullable().optional(),
    montoMinimoGratis: moneySchema.nullable().optional(),
    servicios: z.array(shippingServiceApiSchema).default([]),
});

export type ShippingServiceApi = z.infer<typeof shippingServiceApiSchema>;
export type ShippingOptionsApi = z.infer<typeof shippingOptionsApiSchema>;

export type ShippingServiceCosts = {
    tarifa: number;
    recargo: number;
    enLinea: number;
    contraEntrega: number;
};
