import { z } from 'zod';

/** {@code DatosAgregarItem}. */
export const addCartItemRequestSchema = z.object({
    productoId: z.number().int().positive(),
    cantidad: z.number().int().min(1),
});

/** {@code DatosActualizarCantidad}. */
export const updateCartItemQuantityRequestSchema = z.object({
    cantidad: z.number().int().min(1),
});

export type AddCartItemRequest = z.infer<typeof addCartItemRequestSchema>;
export type UpdateCartItemQuantityRequest = z.infer<typeof updateCartItemQuantityRequestSchema>;
