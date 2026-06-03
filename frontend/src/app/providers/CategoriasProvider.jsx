import { createContext, useContext } from 'react';
import { useCategorias as useCategoriasHook } from '@/hooks/useCategorias';

const CategoriasContext = createContext();

const useCategoriasContextValue = () => {
    const context = useContext(CategoriasContext);
    if (!context) {
        throw new Error('useCategorias debe ser usado dentro de un CategoriasProvider');
    }
    return context;
};

export function CategoriasProvider({ children }) {
    const categoriasData = useCategoriasHook();

    return (
        <CategoriasContext.Provider value={categoriasData}>
            {children}
        </CategoriasContext.Provider>
    );
}

export const useCategorias = useCategoriasContextValue;
