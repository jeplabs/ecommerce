import { type ReactNode } from 'react';
import { useProducts } from '@/features/catalog';
import { ProductContext } from './product-context';

type ProductProviderProps = {
    children: ReactNode;
};

export function ProductProvider({ children }: ProductProviderProps) {
    const productsLogic = useProducts();

    return (
        <ProductContext.Provider value={productsLogic}>{children}</ProductContext.Provider>
    );
}
