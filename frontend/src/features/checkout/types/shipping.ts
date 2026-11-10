import { z } from 'zod';
import { moneySchema, positiveIntSchema } from '@/shared/lib/zod-helpers';
import { formaPagoSchema } from './order';

/** {@code DatosRespuestaServicioEnvio}. */
export const shippingServiceApiSchema = z.object({
    id: positiveIntSchema,
    nombre: z.string(),
    descripcion: z.string().nullable().optional(),
    sinContraEntrega: z.boolean(),
    retiroTienda: z.boolean().optional(),
    notaExpress: z.string().nullable().optional(),
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
    enLinea: number;
    contraEntrega: number;
};

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
