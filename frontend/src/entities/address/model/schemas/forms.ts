import { z } from 'zod';
import type { AddressApi } from './api';

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
        referencias: values.referencias?.trim() ?? '',
    };
}

export type { AddressApi };
