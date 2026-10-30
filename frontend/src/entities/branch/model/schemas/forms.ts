import { z } from 'zod';

export const branchFormSchema = z.object({
    nombre: z
        .string()
        .trim()
        .min(1, 'El nombre de la sucursal es obligatorio')
        .max(100, 'El nombre no puede superar 100 caracteres'),
    direccion: z
        .string()
        .trim()
        .min(1, 'La dirección es obligatoria')
        .max(255, 'La dirección no puede superar 255 caracteres'),
    ciudad: z
        .string()
        .trim()
        .min(1, 'La ciudad es obligatoria')
        .max(100, 'La ciudad no puede superar 100 caracteres'),
    estado: z
        .string()
        .trim()
        .max(100, 'El estado no puede superar 100 caracteres')
        .optional()
        .or(z.literal('')),
    codigoPostal: z
        .string()
        .trim()
        .max(20, 'El código postal no puede superar 20 caracteres')
        .optional()
        .or(z.literal('')),
    pais: z
        .string()
        .trim()
        .min(1, 'El país es obligatorio')
        .max(100, 'El país no puede superar 100 caracteres')
        .default('GT'),
    telefono: z
        .string()
        .trim()
        .min(1, 'El teléfono es obligatorio')
        .max(30, 'El teléfono no puede superar 30 caracteres'),
    horario: z
        .string()
        .trim()
        .min(1, 'El horario de atención es obligatorio')
        .max(255, 'El horario no puede superar 255 caracteres'),
    referencias: z
        .string()
        .trim()
        .max(500, 'Las referencias no pueden superar 500 caracteres')
        .optional()
        .or(z.literal('')),
    mapaUrl: z
        .string()
        .trim()
        .max(500, 'El enlace no puede superar 500 caracteres')
        .optional()
        .or(z.literal('')),
    ordenVisualizacion: z
        .preprocess(
            (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
            z.number().int().min(1, 'El orden mínimo es 1').optional()
        ),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;

export type CreateBranchRequest = {
    nombre: string;
    direccion: string;
    ciudad: string;
    estado?: string | null;
    codigoPostal?: string | null;
    pais: string;
    telefono: string;
    horario: string;
    referencias?: string | null;
    mapaUrl?: string | null;
    ordenVisualizacion?: number | null;
};

export type UpdateBranchRequest = Partial<CreateBranchRequest>;

