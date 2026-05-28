import { createContext, useContext } from 'react';
import { useCart } from './CartContext';
import { useEnvioOpciones } from '../hooks/useEnvioOpciones';

const EnvioOpcionesContext = createContext(null);

export const useEnvioOpcionesContext = () => {
    const context = useContext(EnvioOpcionesContext);
    if (!context) {
        throw new Error('useEnvioOpcionesContext debe usarse dentro de EnvioOpcionesProvider');
    }
    return context;
};

/**
 * Provee opciones de envío del backend alineadas al subtotal del carrito (checkout).
 */
export function EnvioOpcionesProvider({ children }) {
    const { cartTotal } = useCart();
    const envio = useEnvioOpciones(cartTotal);

    return (
        <EnvioOpcionesContext.Provider value={envio}>
            {children}
        </EnvioOpcionesContext.Provider>
    );
}
