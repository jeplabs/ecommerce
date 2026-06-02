import { z } from 'zod';

// 1. Estados del flujo de la orden
export const orderStatusSchema = z.enum([
  'pending',      // Creada, esperando pago
  'paid',         // Pago confirmado
  'processing',   // Preparando pedido
  'shipped',      // En camino
  'delivered',    // Entregada (Finalizado feliz)
  'cancelled',    // Cancelada
  'refunded'      // Reembolsada
]);

// 2. Estados del pago
export const paymentStatusSchema = z.enum([
  'pending',
  'authorized',   // Tarjeta validada pero no cobrada
  'captured',     // Cobrado exitosamente
  'failed',       // Pago rechazado
  'refunded'
]);

// 3. Métodos de pago
export const paymentMethodSchema = z.enum([
  'credit_card',
  'debit_card',
  'paypal',
  'bank_transfer',
  'cash_on_delivery'
]);

// 4. Esquema de Dirección de Envío (Snapshot)
// Importante: Es una copia de los datos en el momento de la compra, no un ID de referencia
export const shippingAddressSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  street: z.string().min(5),
  apartment: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  phone: z.string(),
});

// 5. Ítem de la Orden
export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(), // Nombre congelado al momento de compra
  productImage: z.string().url(),
  sku: z.string(),
  price: z.number().positive(), // Precio unitario congelado
  quantity: z.number().int().positive(),
  discount: z.number().nonnegative().default(0),
});

// 6. Esquema Principal de la Orden
export const orderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(), // Ej: "ORD-2026-8832" (legible para humano)
  userId: z.string().uuid(),
  
  // Estados
  status: orderStatusSchema,
  paymentStatus: paymentStatusSchema,
  paymentMethod: paymentMethodSchema,
  
  // Línea de items
  items: z.array(orderItemSchema),
  
  // Totales financieros
  subtotal: z.number().positive(),
  tax: z.number().nonnegative(),
  shippingCost: z.number().nonnegative(),
  total: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'CLP']).default('USD'),
  
  // Direcciones
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema.optional(),
  
  // Fechas de flujo
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  paidAt: z.string().datetime().optional(),
  shippedAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
  cancelledAt: z.string().datetime().optional(),
  
  // Metadatos
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  adminNotes: z.string().optional(), // Solo visible para admin
  customerNotes: z.string().optional(), // Visible para todos
});

// 7. Esquemas derivados para Acciones

// Para CREAR una orden (Checkout)
// El usuario no elige status ni fechas, eso lo pone el sistema
export const createOrderSchema = orderSchema.omit({
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  createdAt: true,
  updatedAt: true,
  paidAt: true,
  shippedAt: true,
  deliveredAt: true,
  cancelledAt: true,
  trackingNumber: true,
  carrier: true,
  adminNotes: true,
}).extend({
  status: z.literal('pending').default('pending'),
  paymentStatus: z.literal('pending').default('pending'),
});

// Para ACTUALIZAR ESTADO (Solo Admin)
// Restringimos qué campos puede tocar un admin manualmente
export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  adminNotes: z.string().optional(),
});

// Tipos inferidos directos
export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;