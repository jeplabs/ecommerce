import { createContext } from 'react';
import type { UseEnvioOpcionesResult } from '@/entities/shipping';

export type EnvioOpcionesContextValue = UseEnvioOpcionesResult;

export const EnvioOpcionesContext = createContext<EnvioOpcionesContextValue | null>(null);
