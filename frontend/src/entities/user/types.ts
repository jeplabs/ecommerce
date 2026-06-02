import { z } from 'zod';
import {
  userSchema,
  userRoleSchema,
  addressSchema,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  addressInputSchema
} from './schema';

// --- 1. Tipos Principales Inferidos ---
export type User = z.infer<typeof userSchema>;
export type Address = z.infer<typeof addressSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;

// --- 2. Tipos para Formularios ---
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressInputSchema>;

// --- 3. Tipos para Componentes UI ---

// Props para el Navbar (solo necesita lo básico para mostrar "Hola, Nombre" o icono de admin)
export type NavbarUserProps = {
  firstName: string;
  role: UserRole;
  avatarUrl?: string;
  onLogout: () => void;
};

// Props para la tarjeta de dirección en el perfil del cliente
export type AddressCardProps = {
  address: Address;
  isDefault: boolean;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
};

// Props para la fila de la tabla de usuarios (Admin)
export type AdminUserRowProps = {
  user: User;
  onBlock: (id: string) => void;
  onImpersonate?: (id: string) => void; // Funcionalidad avanzada de admin
};

// --- 4. Tipos para API y Auth ---

// Respuesta típica de un login (Usuario + Token)
export type AuthResponse = {
  user: User;
  token: string;
  refreshToken?: string;
};

// Filtros para la tabla de usuarios del admin
export type UserFilters = {
  role?: UserRole;
  search?: string; // Por email o nombre
  status?: 'active' | 'blocked'; // Si manejas bloqueo de usuarios
  page?: number;
  limit?: number;
};

// Estado del contexto de Autenticación (lo que guardarás en tu AuthProvider)
export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  updateUser: (data: UpdateProfileInput) => Promise<void>;
};