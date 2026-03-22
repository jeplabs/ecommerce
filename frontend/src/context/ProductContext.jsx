import { createContext, useState, useEffect } from 'react';
import API_URL from '../config';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const resProductos = await fetch(`${API_URL}/productos`);
                
                if (!resProductos.ok) {
                    throw new Error('No se pudo obtener los productos');
                }

                const productos = await resProductos.json();
                
                if (!Array.isArray(productos)) {
                    throw new Error('El productos no es un array');
                }

                const resCategorias = await fetch(`${API_URL}/productos/categorias`);
                
                if (!resCategorias.ok) {
                    throw new Error('No se pudo obtener las categorias');
                }

                const categorias = await resCategorias.json();
                
                if (!Array.isArray(categorias)) {
                    throw new Error('Las categorias no es un array');
                }
                
                setProductos(productos);
                setCategorias(categorias);

            } catch (error) {
                console.error('Error al obtener los productos', error);
            }
        };
        fetchProductos();
    }, []);

    return (
        <ProductContext.Provider value={{ productos, categorias }}>
            {children}
        </ProductContext.Provider>
    );
};