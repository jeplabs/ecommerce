import { useContext } from 'react';
import { EnvioOpcionesContext } from './envio-opciones-context';
import type { UseEnvioOpcionesResult } from '@/entities/shipping';

export function useEnvioOpcionesContext(): UseEnvioOpcionesResult {
    const context = useContext(EnvioOpcionesContext);
    if (!context) {
        throw new Error('useEnvioOpcionesContext debe usarse dentro de EnvioOpcionesProvider');
    }
    return context;
}
