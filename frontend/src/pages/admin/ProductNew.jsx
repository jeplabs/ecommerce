import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';
import { useToast } from '../../context/ToastContext';
import Navbar from "../../components/Navbar"
import { ProductForm } from "../../components/admin/ProductForm";

export default function ProductNew() {
    const navigate = useNavigate();
    const { createProduct, loading, categorias, subcategorias } = useProduct();
    const { showSuccess, showError } = useToast();
    const [error, setError] = useState(null);

    const handleCreate = async (productData) => {
        try {
            await createProduct(productData);
            showSuccess('Producto creado exitosamente');
            navigate('/admin/products');
        } catch (error) {
            showError(`Error al crear el producto: ${error.message}`);
            setError(error.message);
        }
    };


    return (
        <>
            <Navbar />
            <h1>Crear Producto</h1>
            {error && <p className='error'>{error}</p>}
            <ProductForm 
                onSubmit={handleCreate} 
                isSubmitting={loading}
                categorias={categorias}
                subcategorias={subcategorias}
            />
        </>
    );
}