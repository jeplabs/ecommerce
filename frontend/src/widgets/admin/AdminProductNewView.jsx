import { useProduct, useCategorias, useToast } from '@/app/providers';
import { useState } from 'react';
import { ProductForm } from '@/features/admin/ui/ProductForm';

export default function AdminProductNewView({ onNavigate }) {
    const { createProduct, loading } = useProduct();
    const { arbolCategorias } = useCategorias();
    const { showSuccess, showError } = useToast();
    const [error, setError] = useState(null);

    const handleCreate = async (productData) => {
        try {
            await createProduct(productData);
            showSuccess('Producto creado exitosamente');
            onNavigate('/admin/products');
        } catch (error) {
            showError(`Error al crear el producto: ${error.message}`);
            setError(error.message);
        }
    };
    
    const handleCancel = () => {
        onNavigate('/admin/products');
    };

    return (
        <main className="product-new-container">
            <h1>Crear Producto</h1>
            {error && <p className="error">{error}</p>}
            <ProductForm
                onSubmit={handleCreate}
                isSubmitting={loading}
                arbolCategorias={arbolCategorias}
                onCancel={handleCancel}
            />
        </main>
    );
}