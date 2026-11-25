import { z } from 'zod';
import { bannerSectionSchema } from './api';

export const bannerFormSchema = z
    .object({
        seccion: bannerSectionSchema.default('HERO_CAROUSEL'),
        titulo: z
            .string()
            .trim()
            .min(1, 'El título es obligatorio')
            .max(150, 'El título no puede exceder 150 caracteres'),
        desktopUrl: z
            .string()
            .trim()
            .min(1, 'La imagen de escritorio es obligatoria')
            .url('Debe ser una URL válida')
            .max(500, 'La URL no puede exceder 500 caracteres'),
        mobileUrl: z
            .string()
            .trim()
            .max(500, 'La URL no puede exceder 500 caracteres')
            .refine(
                (val) => !val || /^https?:\/\//i.test(val),
                'Debe ser una URL válida que comience con http:// o https://'
            )
            .optional()
            .or(z.literal('')),
        linkUrl: z
            .string()
            .trim()
            .max(500, 'El enlace no puede exceder 500 caracteres')
            .refine(
                (val) => !val || !/^(javascript|data|vbscript):/i.test(val),
                'El formato o protocolo de enlace no es seguro'
            )
            .optional()
            .or(z.literal('')),
        orden: z.number().int().min(1).nullable().optional(),
        activo: z.boolean().default(true),
        fechaInicio: z.string().nullable().optional(),
        fechaFin: z.string().nullable().optional(),
    })
    .refine(
        (data) => {
            if (data.fechaInicio && data.fechaFin) {
                return new Date(data.fechaFin) > new Date(data.fechaInicio);
            }
            return true;
        },
        {
            message: 'La fecha de fin debe ser estrictamente posterior a la fecha de inicio',
            path: ['fechaFin'],
        }
    );

export type BannerFormValues = z.infer<typeof bannerFormSchema>;
