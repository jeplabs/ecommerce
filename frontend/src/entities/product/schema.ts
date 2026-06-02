import { z } from 'zod';

// 1. Definición de estados posibles
export const productStatusSchema = z.enum([
    'active',       // Visible en la tienda
    'draft',        // Borrador (solo admin lo ve)
    'archived',     // Ya no se vende, pero se guarda histórico
    'out_of_stock'  // Visible pero no comprable
]);

// 2. Esquema principal del Producto
export const productSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    slug: z.string().min(3), // Para URLs amigables
    description: z.string().min(10, 'La descripción es muy corta'),
    
    // Precios y Stock
    price: z.number().positive('El precio debe ser mayor a 0'),
    discountPrice: z.number().positive().optional(), // Precio de oferta
    stock: z.number().int().nonnegative('El stock no puede ser negativo'),
    
    // Clasificación
    category: z.string(),
    tags: z.array(z.string()),
    images: z.array(z.string().url('Debe ser una URL válida')),
    
    // Estado y Fechas
    status: productStatusSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional(),
});

// 3. Esquemas derivados para acciones específicas

// Para CREAR un producto (el backend genera el ID y las fechas)
export const createProductSchema = productSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    // El estado por defecto al crear suele ser 'draft' o 'active'
    status: z.literal('draft').default('draft'), 
});

// Para ACTUALIZAR un producto (todos los campos opcionales excepto el ID que va en la URL)
export const updateProductSchema = productSchema.partial().omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

// Tipos inferidos (exportados aquí para conveniencia, aunque lo ideal es usar types.ts)
export type Product = z.infer<typeof productSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;