import { z } from 'zod';
import type { UserApi } from '@/features/auth';

export type { UserApi };

/** {@code DatosActualizarPerfil}. */
export const updateProfileFormSchema = z.object({
    nombre: z.string().min(2).max(100),
    apellido: z.string().min(2).max(100),
    pais: z.string().min(2).max(100),
});

/** Reglas alineadas con {@code @ValidPassword} del backend. */
const strongPasswordSchema = z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
        'La contraseña debe tener al menos una mayúscula, un número y un carácter especial'
    );

/** {@code DatosActualizarPassword}. */
export const updatePasswordFormSchema = z
    .object({
        passwordActual: z.string().min(1, 'La contraseña actual es obligatoria'),
        password: strongPasswordSchema,
        confirmarPassword: z.string().min(1, 'Debes confirmar la nueva contraseña'),
    })
    .refine((data) => data.password === data.confirmarPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmarPassword'],
    });

export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;
export type UpdateProfileRequest = UpdateProfileFormValues;
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordFormSchema>;
export type UpdatePasswordRequest = UpdatePasswordFormValues;

export function mapUpdateProfileFormToRequest(values: UpdateProfileFormValues): UpdateProfileRequest {
    return {
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        pais: values.pais.trim(),
    };
}

export function mapUpdatePasswordFormToRequest(values: UpdatePasswordFormValues): UpdatePasswordRequest {
    return {
        passwordActual: values.passwordActual,
        password: values.password,
        confirmarPassword: values.confirmarPassword,
    };
}

export type ProfileActionResult<T = UserApi> =
    | { success: true; data: T }
    | { success: false; error: string };

export * from './address';
