import { createContext, useContext, type ReactNode } from 'react';
import { useCart } from '@/app/providers/CartProvider';
import { useEnvioOpciones } from '@/entities/shipping/model/useEnvioOpciones';
import type { UseEnvioOpcionesResult } from '@/entities/shipping';

const EnvioOpcionesContext = createContext<UseEnvioOpcionesResult | null>(null);

export const useEnvioOpcionesContext = (): UseEnvioOpcionesResult => {
    const context = useContext(EnvioOpcionesContext);
    if (!context) {
        throw new Error('useEnvioOpcionesContext debe usarse dentro de EnvioOpcionesProvider');
    }
    return context;
};

type EnvioOpcionesProviderProps = {
    children: ReactNode;
};

/** Opciones de envío del backend según subtotal del carrito (checkout). */
export function EnvioOpcionesProvider({ children }: EnvioOpcionesProviderProps) {
    const { cartTotal } = useCart();
    const envio = useEnvioOpciones(cartTotal);

    return (
        <EnvioOpcionesContext.Provider value={envio}>{children}</EnvioOpcionesContext.Provider>
    );
}
