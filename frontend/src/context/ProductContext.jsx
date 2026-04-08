import { createContext, useContext } from 'react';
import { useProducts } from '../hooks/useProducts';

const ProductContext = createContext();

export const useProduct = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProduct debe ser usado dentro de un ProductProvider');
    }
    return context;
};

export const ProductProvider = ({ children }) => {
    // Simplemente usamos toda la lógica de nuestro hook personalizado
    const productsLogic = useProducts();

    return (
        <ProductContext.Provider value={productsLogic}>
            {children}
        </ProductContext.Provider>
    );
};