import { type ReactNode } from 'react';
import { useCart } from '@/app/providers/useCart';
import { useEnvioOpciones } from '@/entities/shipping/model/useEnvioOpciones';
import { EnvioOpcionesContext } from './envio-opciones-context';

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
