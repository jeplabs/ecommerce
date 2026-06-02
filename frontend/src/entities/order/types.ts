import { z } from 'zod';
import {
  orderSchema,
  orderStatusSchema,
  orderItemSchema,
  shippingAddressSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  paymentStatusSchema
} from './schema';

// --- 1. Tipos Principales Inferidos ---
export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

// --- 2. Tipos para Formularios ---
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// --- 3. Tipos para Componentes UI ---

// Resumen para el historial del cliente (Lista)
export type OrderSummaryCardProps = {
  id: string;
  orderNumber: string;
  date: string; // ISO Date
  total: number;
  status: OrderStatus;
  itemsCount: number;
  onViewDetails: (id: string) => void;
};

// Fila para la tabla del Admin (Gestión masiva)
export type AdminOrderRowProps = {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onViewDetails: (id: string) => void;
};

// Detalle completo (Página individual)
export type OrderDetailProps = {
  order: Order;
  isAdmin?: boolean; // Para mostrar notas internas o botones de acción
};

// --- 4. Tipos para API y Lógica ---

// Filtros avanzados para el panel de Admin
export type OrderFilters = {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string; // Por OrderNumber o Email del cliente
  page?: number;
  limit?: number;
};

// Respuesta paginada de API
export type OrdersApiResponse = {
  data: Order[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
};

// Estadísticas para el Dashboard del Admin
export type OrderStats = {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  period: 'today' | 'week' | 'month' | 'year';
};