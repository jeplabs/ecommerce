import { z } from 'zod';

// 1. Roles del sistema
export const userRoleSchema = z.enum(['customer', 'admin']);

// 2. Esquema de Dirección (Reutilizable para envío y facturación)
export const addressSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(2, 'Nombre requerido'),
  lastName: z.string().min(2, 'Apellido requerido'),
  street: z.string().min(5, 'Dirección muy corta'),
  apartment: z.string().optional(), // Depto, piso, etc.
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().min(2, 'Región/Estado requerido'),
  zipCode: z.string().min(4, 'Código postal inválido'),
  country: z.string().min(2, 'País requerido'),
  phone: z.string().min(8, 'Teléfono inválido'),
  isDefault: z.boolean().default(false),
});

// 3. Esquema Principal del Usuario
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Email inválido'),
  // Contraseña solo para creación/actualización, no viene en la respuesta de "get user" por seguridad
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(), 
  
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: userRoleSchema,
  
  // Lista de direcciones guardadas
  addresses: z.array(addressSchema).default([]),
  
  // Metadatos
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  lastLoginAt: z.string().datetime().optional(),
});

// 4. Esquemas derivados para Acciones

// Para REGISTRO (No pide ID, ni fechas, ni rol - el rol por defecto es customer)
export const registerSchema = userSchema.omit({
  id: true,
  role: true,
  addresses: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
}).extend({
  role: z.literal('customer').default('customer'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Para LOGIN (Solo email y password)
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'La contraseña es requerida'),
});

// Para ACTUALIZAR PERFIL (Todo opcional excepto email/id que suelen ser fijos o manejados aparte)
// Aquí permitimos actualizar nombre, teléfono, etc., pero NO el rol ni la password directamente aquí
export const updateProfileSchema = userSchema.partial().omit({
  id: true,
  role: true,
  password: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  addresses: true, // Las direcciones se gestionan en un endpoint separado usualmente
});

// Para AGREGAR/EDITAR una dirección específica
export const addressInputSchema = addressSchema.omit({ id: true, isDefault: true }).partial();

// Tipos inferidos directos (para uso interno rápido)
export type User = z.infer<typeof userSchema>;
export type Address = z.infer<typeof addressSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;