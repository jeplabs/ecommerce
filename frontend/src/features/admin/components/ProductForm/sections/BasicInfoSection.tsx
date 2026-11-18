import type { ChangeEvent } from 'react';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { ProductFormData, FormErrors } from '../types';

interface BasicInfoSectionProps {
    formData: ProductFormData;
    errors: FormErrors;
    isEditing: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function BasicInfoSection({
    formData,
    errors,
    isEditing,
    onChange,
}: BasicInfoSectionProps) {
    return (
        <>
            <FormField label="Nombre" htmlFor="nombre" error={errors.nombre}>
                <Input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={onChange}
                    placeholder="Nombre del producto"
                    required
                    invalid={!!errors.nombre}
                />
            </FormField>

            <FormField label="SKU" htmlFor="sku" error={errors.sku}>
                <Input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={onChange}
                    placeholder="SKU del producto"
                    disabled={isEditing}
                    required
                    invalid={!!errors.sku}
                />
            </FormField>

            <FormField label="Descripción" htmlFor="descripcion" error={errors.descripcion}>
                <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={onChange}
                    placeholder="Descripción del producto"
                    required
                    invalid={!!errors.descripcion}
                />
            </FormField>
        </>
    );
}
