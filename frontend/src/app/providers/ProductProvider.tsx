import { createContext, useContext, type ReactNode } from 'react';
import { useProducts } from '@/entities/product/model/useProducts';

export type ProductContextValue = ReturnType<typeof useProducts>;

const ProductContext = createContext<ProductContextValue | null>(null);

export const useProduct = (): ProductContextValue => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProduct debe ser usado dentro de un ProductProvider');
    }
    return context;
};

type ProductProviderProps = {
    children: ReactNode;
};

export function ProductProvider({ children }: ProductProviderProps) {
    const productsLogic = useProducts();

    return (
        <ProductContext.Provider value={productsLogic}>{children}</ProductContext.Provider>
    );
}
