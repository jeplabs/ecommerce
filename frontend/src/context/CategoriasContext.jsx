import { createContext, useContext } from 'react';
// Importamos con un alias interno para evitar conflicto de nombres
import { useCategorias as useCategoriasHook } from '../hooks/useCategorias';

const CategoriasContext = createContext();

// Hook interno que valida el contexto
const useCategoriasContextValue = () => {
    const context = useContext(CategoriasContext);
    if (!context) {
        throw new Error('useCategorias debe ser usado dentro de un CategoriasProvider');
    }
    return context;
};

export const CategoriasProvider = ({ children }) => {
    // Usamos el hook importado (con alias) para obtener los datos
    const categoriasData = useCategoriasHook();

    return (
        <CategoriasContext.Provider value={categoriasData}>
            {children}
        </CategoriasContext.Provider>
    );
};

// Exportamos el hook de validación con el nombre original que usa tu app
// Así tus componentes siguen haciendo: import { useCategorias } from ...
export const useCategorias = useCategoriasContextValue;