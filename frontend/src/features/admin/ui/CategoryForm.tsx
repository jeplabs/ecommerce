import { useState, type FormEvent } from 'react';
import type { CategoryApi } from '@/entities/category';
import type { CreateCategoryRequest } from '@/entities/category';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form/Form';
import { FieldError, FormField } from '@/shared/ui/FormField';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';

type CategoryFormProps = {
    categorias?: CategoryApi[];
    onCreate: (payload: CreateCategoryRequest) => Promise<void>;
    isLoading?: boolean;
};

export function CategoryForm({ categorias = [], onCreate, isLoading }: CategoryFormProps) {
    const [nombre, setNombre] = useState('');
    const [parentId, setParentId] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!nombre.trim()) {
            setError('El nombre de la categoría es obligatorio');
            return;
        }

        const payload: CreateCategoryRequest = {
            nombre: nombre.trim(),
            parentId: parentId ? Number(parentId) : null,
        };

        try {
            await onCreate(payload);
            setNombre('');
            setParentId('');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al crear la categoría';
            setError(message);
        }
    };

    return (
        <section className="category-form">
            <h2>Crear categoría</h2>
            <Form variant="wide" onSubmit={handleSubmit}>
                <FormField label="Nombre" htmlFor="categoria-nombre">
                    <Input
                        id="categoria-nombre"
                        name="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej. Electrónica"
                        required
                    />
                </FormField>

                <FormField label="Categoría padre (opcional)" htmlFor="categoria-parent">
                    <Select
                        id="categoria-parent"
                        value={parentId}
                        onChange={(e) => setParentId(e.target.value)}
                    >
                        <option value="">-- Ningún padre --</option>
                        {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nombre}
                            </option>
                        ))}
                    </Select>
                </FormField>

                {error && <FieldError>{error}</FieldError>}

                <Button type="submit" variant="primary" disabled={isLoading}>
                    {isLoading ? 'Creando...' : 'Crear categoría'}
                </Button>
            </Form>
        </section>
    );
}
