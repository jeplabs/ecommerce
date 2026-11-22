import { z } from 'zod';
import { positiveIntSchema } from '@/utils/zod-helpers';

/** {@code DatosRespuestaDireccion}. */
export const addressApiSchema = z.object({
    id: positiveIntSchema,
    alias: z.string(),
    direccion: z.string(),
    ciudad: z.string(),
    estado: z.string(),
    codigoPostal: z.string().nullable().optional(),
    pais: z.string(),
    telefono: z.string(),
    referencias: z.string().nullable().optional(),
    principal: z.boolean(),
    activo: z.boolean(),
});

export type AddressApi = z.infer<typeof addressApiSchema>;

/** {@code DatosCrearDireccion}. */
export const createAddressRequestSchema = z.object({
    alias: z.string().min(1).max(50),
    direccion: z.string().min(1).max(255),
    ciudad: z.string().min(1).max(100),
    estado: z.string().min(1).max(100),
    codigoPostal: z.string().max(20).optional(),
    pais: z.string().min(1).max(100),
    telefono: z.string().regex(/^[+]?[0-9]{8,15}$/, 'Formato de teléfono inválido'),
    referencias: z.string().max(500).optional(),
    principal: z.boolean().default(false),
});

/** {@code DatosActualizarDireccion} — PATCH parcial. */
export const updateAddressRequestSchema = createAddressRequestSchema.partial();

export type CreateAddressRequest = z.infer<typeof createAddressRequestSchema>;
export type UpdateAddressRequest = z.infer<typeof updateAddressRequestSchema>;

/** Formulario perfil / checkout (RHF). */
export const addressFormSchema = z.object({
    alias: z.string().min(1).max(50),
    direccion: z.string().min(1).max(255),
    ciudad: z.string().min(1).max(100),
    estado: z.string().min(1).max(100),
    codigoPostal: z.string().max(20).optional(),
    pais: z.string().min(1).max(100),
    telefono: z.string().regex(/^[+]?[0-9]{8,15}$/, 'Formato de teléfono inválido'),
    referencias: z.string().max(500).optional(),
    principal: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;

export function mapAddressFormToCreateRequest(values: AddressFormValues): CreateAddressRequest {
    return {
        alias: values.alias.trim(),
        direccion: values.direccion.trim(),
        ciudad: values.ciudad.trim(),
        estado: values.estado.trim(),
        codigoPostal: values.codigoPostal?.trim() || undefined,
        pais: values.pais.trim(),
        telefono: values.telefono.trim(),
        referencias: values.referencias?.trim() || undefined,
        principal: values.principal ?? false,
    };
}

/** PATCH completo desde el formulario de edición (incluye `referencias` en el body). */
export function mapAddressFormToUpdateRequest(values: AddressFormValues): UpdateAddressRequest {
    return {
        alias: values.alias.trim(),
        direccion: values.direccion.trim(),
        ciudad: values.ciudad.trim(),
        estado: values.estado.trim(),
        codigoPostal: values.codigoPostal?.trim() || undefined,
        pais: values.pais.trim(),
        telefono: values.telefono.trim(),
        referencias: values.referencias?.trim() ?? undefined,
    };
}

export type AddressCardView = {
    id: number;
    alias: string;
    linea1: string;
    linea2: string;
    telefono: string;
    principal: boolean;
    activo: boolean;
};

export type AddressCheckoutView = AddressCardView;

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

export type AddressActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string; fields?: unknown };
