import { createContext, useContext } from 'react';
import { useCart } from '@/app/providers/CartProvider';
import { useEnvioOpciones } from '@/entities/shipping/model/useEnvioOpciones';

const EnvioOpcionesContext = createContext(null);

export const useEnvioOpcionesContext = () => {
    const context = useContext(EnvioOpcionesContext);
    if (!context) {
        throw new Error('useEnvioOpcionesContext debe usarse dentro de EnvioOpcionesProvider');
    }
    return context;
};

/** Opciones de envío del backend según subtotal del carrito (checkout). */
export function EnvioOpcionesProvider({ children }) {
    const { cartTotal } = useCart();
    const envio = useEnvioOpciones(cartTotal);

    return (
        <EnvioOpcionesContext.Provider value={envio}>{children}</EnvioOpcionesContext.Provider>
    );
}
