import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form/Form';
import { useProductFormState } from './hooks/useProductFormState';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { PricingInventorySection } from './sections/PricingInventorySection';
import { CategoriesSection, AdditionalCategoriesList } from './sections/CategoriesSection';
import { SpecsSection } from './sections/SpecsSection';
import { ImagesSection } from './sections/ImagesSection';
import type { ProductFormProps } from './types';
import styles from './ProductForm.module.css';

export * from './types';

export const ProductForm = ({
    initialData = null,
    onSubmit,
    isSubmitting = false,
    onCancel,
    arbolCategorias = [],
    preserveMissingMetadata = false,
}: ProductFormProps) => {
    const {
        formData,
        errors,
        isEditing,
        isZeroDecimalCurrency,
        urlInput,
        setUrlInput,
        specs,
        additionalCategories,
        handleChange,
        handleSubmit,
        addSpec,
        updateSpec,
        removeSpec,
        addAdditionalCategory,
        updateAdditionalCategory,
        removeAdditionalCategory,
        handleAddUrl,
        handleAddImageUrls,
        removeImage,
        handleSetPrincipal,
    } = useProductFormState({
        initialData,
        onSubmit,
        arbolCategorias,
        preserveMissingMetadata,
    });

    return (
        <section className={styles.productForm}>
            <Form variant="wide" onSubmit={handleSubmit} noValidate>
                <BasicInfoSection
                    formData={formData}
                    errors={errors}
                    isEditing={isEditing}
                    onChange={handleChange}
                />

                {/* Campos de precio, stock y categorías en grilla formRow */}
                <div className={styles.formRow}>
                    <PricingInventorySection
                        formData={formData}
                        errors={errors}
                        isZeroDecimalCurrency={isZeroDecimalCurrency}
                        onChange={handleChange}
                    />

                    <CategoriesSection
                        formData={formData}
                        arbolCategorias={arbolCategorias}
                        onChange={handleChange}
                        onAddAdditional={addAdditionalCategory}
                    />
                </div>

                {/* Categorías Adicionales */}
                <AdditionalCategoriesList
                    additionalCategories={additionalCategories}
                    arbolCategorias={arbolCategorias}
                    onUpdateAdditional={updateAdditionalCategory}
                    onRemoveAdditional={removeAdditionalCategory}
                />

                {/* Specs */}
                <SpecsSection
                    specs={specs}
                    error={errors.specs}
                    onAdd={addSpec}
                    onUpdate={updateSpec}
                    onRemove={removeSpec}
                />

                {/* Imágenes */}
                <ImagesSection
                    images={formData.images}
                    urlInput={urlInput}
                    error={errors.images}
                    onUrlInputChange={setUrlInput}
                    onAddUrl={handleAddUrl}
                    onAddUploadedUrls={handleAddImageUrls}
                    onRemove={removeImage}
                    onSetPrincipal={handleSetPrincipal}
                />

                {/* Botones de acción */}
                <div className={styles.actions}>
                    <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
                        {isSubmitting
                            ? 'Guardando...'
                            : isEditing
                            ? 'Actualizar Producto'
                            : 'Agregar Producto'}
                    </Button>
                    {onCancel && (
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                    )}
                </div>
            </Form>
        </section>
    );
};

export default ProductForm;
