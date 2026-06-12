import { useContext } from 'react';
import { CategoriasContext, type CategoriasContextValue } from './categorias-context';

export type { CategoriasContextValue };

export function useCategorias(): CategoriasContextValue {
    const context = useContext(CategoriasContext);
    if (!context) {
        throw new Error('useCategorias debe ser usado dentro de un CategoriasProvider');
    }
    return context;
}
