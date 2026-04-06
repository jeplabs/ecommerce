// src/services/productService.js (o donde tengas tus fetch)
import { API_URL } from '../config/config'; // Tu configuración

export const getProductsByCategoryId = async (categoryId) => {
    try {
        // Opción A: Si tu backend soporta filtrado por query param (Recomendado)
        const response = await fetch(`${API_URL}/productos?categoriaId=${categoryId}`);
        
        // Opción B: Si tu backend tiene un endpoint específico
        // const response = await fetch(`${API_URL}/productos/categoria/${categoryId}`);

        if (!response.ok) throw new Error('Error al obtener productos de la categoría');
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en getProductsByCategoryId:", error);
        throw error;
    }
};