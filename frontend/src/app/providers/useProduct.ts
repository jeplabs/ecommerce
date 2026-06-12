import { useContext } from 'react';
import { ProductContext, type ProductContextValue } from './product-context';

export type { ProductContextValue };

export function useProduct(): ProductContextValue {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProduct debe ser usado dentro de un ProductProvider');
    }
    return context;
}
