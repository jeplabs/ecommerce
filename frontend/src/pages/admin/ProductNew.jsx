import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';
import { useCategorias } from '../../context/CategoriasContext';
import { useToast } from '../../context/ToastContext';
import Navbar from "../../components/layout/Navbar/Navbar";
import { ProductForm } from "../../components/admin/ProductForm";

export default function ProductNew() {
    const navigate = useNavigate();
    const { createProduct, loading } = useProduct();
    const { arbolCategorias } = useCategorias();
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
    
    const handleCancel = () => {
        navigate('/admin/products');
    };

    return (
        <>
            <Navbar />
            <h1>Crear Producto</h1>
            {error && <p className='error'>{error}</p>}
            <ProductForm 
                onSubmit={handleCreate} 
                isSubmitting={loading}
                arbolCategorias={arbolCategorias}
                onCancel={handleCancel}
            />
        </>
    );
}