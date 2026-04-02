import { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config/config';

const CategoriasContext = createContext();

export const useCategorias = () => {
    const context = useContext(CategoriasContext);
    if (!context) {
        throw new Error('useCategorias debe ser usado dentro de un CategoriasProvider');
    }
    return context;
};

const getAuthHeaders = (isJson = true) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (isJson) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

export const CategoriasProvider = ({ children }) => {
    const [arbolCategorias, setArbolCategorias] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getCategorias = async () => {
            setLoading(true);
            try {
                const resCategorias = await fetch(`${API_URL}/api/categorias`);
                if (resCategorias.ok) {
                    const categoriasData = await resCategorias.json();
                    // console.log('arbolCategorias', categoriasData);
                    setArbolCategorias(categoriasData);
                } else {
                    console.error('Error al cargar categorías:', resCategorias.statusText);
                }
            } catch (error) {
                console.error('Error general al cargar datos:', error);
            } finally {
                setLoading(false);
            }
        };
        getCategorias();
    }, []);

    const createCategory = async (categoriaDatos) => {
        setLoading(true);
        try {
            const resCategoria = await fetch(`${API_URL}/api/categorias`, {
                method: 'POST',
                headers: getAuthHeaders(true),
                body: JSON.stringify(categoriaDatos),
            });

            if (resCategoria.status === 401) {
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }

            if (!resCategoria.ok) {
                const errorData = await resCategoria.json();
                throw new Error(errorData.error || 'No se pudo crear la categoría');
            }

            const nuevaCategoria = await resCategoria.json();
            // actualizar categorias localmente sin recargar
            setArbolCategorias((prev) => [...prev, nuevaCategoria]);
            return nuevaCategoria;
        } catch (error) {
            console.error('Error al crear la categoria', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <CategoriasContext.Provider 
            value={{ 
                arbolCategorias,
                loading,
                createCategory,
            }}>
            {children}
        </CategoriasContext.Provider>
    );
};