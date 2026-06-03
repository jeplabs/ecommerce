import { z } from 'zod';

/** {@code DatosLogin}. */
export const loginFormSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

/** {@code DatosRegistro}. */
export const registerFormSchema = z
    .object({
        nombre: z.string().min(2).max(100),
        apellido: z.string().min(2).max(100),
        pais: z.string().min(2).max(100),
        email: z.string().email(),
        password: z.string().min(8, 'Mínimo 8 caracteres'),
        confirmarPassword: z.string().min(1, 'Confirma la contraseña'),
    })
    .refine((data) => data.password === data.confirmarPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmarPassword'],
    });

/** {@code DatosActualizarPerfil}. */
export const updateProfileFormSchema = z.object({
    nombre: z.string().min(2).max(100),
    apellido: z.string().min(2).max(100),
    pais: z.string().min(2).max(100),
});

/** {@code DatosActualizarEstadoUsuario}. */
export const updateUserStatusRequestSchema = z.object({
    activo: z.boolean(),
});

/** {@code DatosActualizarRol} — admin. */
export const updateUserRoleRequestSchema = z.object({
    rol: z.enum(['ROLE_ADMIN', 'ROLE_CUSTOMER']),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;
export type UpdateProfileRequest = UpdateProfileFormValues;

export function mapUpdateProfileFormToRequest(values: UpdateProfileFormValues): UpdateProfileRequest {
    return {
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        pais: values.pais.trim(),
    };
}
export type UpdateUserStatusRequest = z.infer<typeof updateUserStatusRequestSchema>;
export type UpdateUserRoleRequest = z.infer<typeof updateUserRoleRequestSchema>;

export function mapRegisterFormToRequest(values: RegisterFormValues) {
    return {
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        pais: values.pais.trim(),
        email: values.email.trim(),
        password: values.password,
        confirmarPassword: values.confirmarPassword,
    };
}

export function mapLoginFormToRequest(values: LoginFormValues) {
    return {
        email: values.email.trim(),
        password: values.password,
    };
}
