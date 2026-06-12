import { createContext } from 'react';
import type { useAuthLogic } from '@/features/auth/model/useAuthLogic';

export type AuthContextValue = ReturnType<typeof useAuthLogic>;

export const AuthContext = createContext<AuthContextValue | null>(null);
