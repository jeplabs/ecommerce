import type { ChangeEvent } from 'react';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { ProductFormData, FormErrors } from '../types';

interface PricingInventorySectionProps {
    formData: ProductFormData;
    errors: FormErrors;
    isZeroDecimalCurrency: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function PricingInventorySection({
    formData,
    errors,
    isZeroDecimalCurrency,
    onChange,
}: PricingInventorySectionProps) {
    return (
        <>
            <FormField label="Precio" htmlFor="price" error={errors.price}>
                <Input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={onChange}
                    min="0"
                    step={isZeroDecimalCurrency ? '1' : '0.01'}
                    placeholder={isZeroDecimalCurrency ? '0' : '0.00'}
                    onInput={(e) => {
                        const input = e.target as HTMLInputElement;
                        if (Number(input.value) < 0) {
                            input.value = '';
                        }
                    }}
                    required
                    invalid={!!errors.price}
                />
            </FormField>

            <FormField label="Moneda" htmlFor="moneda">
                <Select
                    id="moneda"
                    name="moneda"
                    value={formData.moneda}
                    onChange={onChange}
                >
                    <option value="GTQ">GTQ</option>
                    <option value="CLP">CLP</option>
                </Select>
            </FormField>

            <FormField label="Stock" htmlFor="stock" error={errors.stock}>
                <Input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={onChange}
                    min="0"
                    placeholder="0"
                    required
                    invalid={!!errors.stock}
                />
            </FormField>

            <FormField label="Estado" htmlFor="estado">
                <Select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={onChange}
                    required
                >
                    <option value="disponible">Disponible</option>
                    <option value="sin-stock">Sin stock</option>
                    <option value="oculto">Oculto</option>
                    <option value="descontinuado">Descontinuado</option>
                </Select>
            </FormField>
        </>
    );
}
