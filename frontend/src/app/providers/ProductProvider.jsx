import { createContext, useContext } from 'react';
import { useProducts } from '@/entities/product/model/useProducts';

const ProductContext = createContext();

export const useProduct = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProduct debe ser usado dentro de un ProductProvider');
    }
    return context;
};

export function ProductProvider({ children }) {
    const productsLogic = useProducts();

    return (
        <ProductContext.Provider value={productsLogic}>{children}</ProductContext.Provider>
    );
}
