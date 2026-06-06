import { createContext, useContext, type ReactNode } from 'react';
import { useCategorias as useCategoriasHook } from '@/entities/category/model/useCategorias';

export type CategoriasContextValue = ReturnType<typeof useCategoriasHook>;

const CategoriasContext = createContext<CategoriasContextValue | null>(null);

const useCategoriasContextValue = (): CategoriasContextValue => {
    const context = useContext(CategoriasContext);
    if (!context) {
        throw new Error('useCategorias debe ser usado dentro de un CategoriasProvider');
    }
    return context;
};

type CategoriasProviderProps = {
    children: ReactNode;
};

export function CategoriasProvider({ children }: CategoriasProviderProps) {
    const categoriasData = useCategoriasHook();

    return (
        <CategoriasContext.Provider value={categoriasData}>
            {children}
        </CategoriasContext.Provider>
    );
}

export const useCategorias = useCategoriasContextValue;
