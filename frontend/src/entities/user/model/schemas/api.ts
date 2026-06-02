import { z } from 'zod';
import { positiveIntSchema } from '@/shared/lib/zod-helpers';

/** Alineado a {@code Rol} del backend (valor JSON: ROLE_ADMIN | ROLE_CUSTOMER). */
export const userRoleSchema = z.enum(['ROLE_ADMIN', 'ROLE_CUSTOMER']);

/** {@code DatosRespuestaUsuario}. */
export const userApiSchema = z.object({
    id: positiveIntSchema,
    nombre: z.string(),
    apellido: z.string(),
    email: z.string().email(),
    pais: z.string(),
    rol: userRoleSchema,
    activo: z.boolean(),
    bloqueado: z.boolean(),
    intentosFallidos: z.number().int().nonnegative(),
});

/** {@code DatosRespuestaToken} — respuesta de login. */
export const authTokenResponseSchema = z.object({
    token: z.string(),
    tipo: z.string(),
    id: positiveIntSchema,
    nombre: z.string(),
    apellido: z.string(),
    email: z.string().email(),
    rol: userRoleSchema,
});

export type UserApi = z.infer<typeof userApiSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type AuthTokenResponse = z.infer<typeof authTokenResponseSchema>;
