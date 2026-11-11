import { type ReactNode } from 'react';
import { useCategorias as useCategoriasHook } from '@/features/catalog';
import { CategoriasContext } from './categorias-context';

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
