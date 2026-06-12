import { createContext } from 'react';
import type { UseEnvioOpcionesResult } from '@/entities/shipping';

export const EnvioOpcionesContext = createContext<UseEnvioOpcionesResult | null>(null);
