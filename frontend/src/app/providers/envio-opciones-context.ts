import { createContext } from 'react';
import type { UseEnvioOpcionesResult } from '@/features/checkout/types';

export type EnvioOpcionesContextValue = UseEnvioOpcionesResult;

export const EnvioOpcionesContext = createContext<EnvioOpcionesContextValue | null>(null);
