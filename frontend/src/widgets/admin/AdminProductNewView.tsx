import { useProduct, useCategorias, useToast } from '@/app/providers';
import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { CreateProductRequest } from '@/entities/product';
import { ProductForm } from '@/features/admin/ui/ProductForm';
import { FieldError } from '@/shared/ui/FormField';
import type { ProductFormSubmitPayload } from '@/features/admin/ui/ProductForm';
import type { AdminProductFormImage } from '@/features/admin/lib/product-image-admin';

type AdminProductNewViewProps = {
    onNavigate: NavigateFunction;
};

export default function AdminProductNewView({ onNavigate }: AdminProductNewViewProps) {
    const { createProduct, loading } = useProduct();
    const { arbolCategorias } = useCategorias();
    const { showSuccess, showError } = useToast();
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async (
        payload: ProductFormSubmitPayload,
        _images: AdminProductFormImage[]
    ) => {
        try {
            const productData: CreateProductRequest = {
                sku: payload.sku,
                nombre: payload.nombre,
                descripcion: payload.descripcion,
                specs: payload.specs,
                stock: payload.stock,
                precio: payload.precio,
                categoriaIds: payload.categoriaIds,
                imagenesUrl: payload.imagenesUrl ?? undefined,
            };
            await createProduct(productData);
            showSuccess('Producto creado exitosamente');
            onNavigate('/admin/products');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al crear el producto';
            showError(`Error al crear el producto: ${message}`);
            setError(message);
        }
    };

    const handleCancel = () => {
        onNavigate('/admin/products');
    };

    return (
        <main className="product-new-container">
            <h1>Crear Producto</h1>
            {error && <FieldError>{error}</FieldError>}
            <ProductForm
                onSubmit={handleCreate}
                isSubmitting={loading}
                arbolCategorias={arbolCategorias}
                onCancel={handleCancel}
            />
        </main>
    );
}
