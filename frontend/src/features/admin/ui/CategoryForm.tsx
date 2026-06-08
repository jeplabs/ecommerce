import { useState, type FormEvent } from 'react';
import type { CategoryApi } from '@/entities/category';
import type { CreateCategoryRequest } from '@/entities/category';
import { Button } from '@/shared/ui/Button';

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
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="categoria-nombre">Nombre</label>
                    <input
                        id="categoria-nombre"
                        name="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej. Electrónica"
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="categoria-parent">Categoría padre (opcional)</label>
                    <select
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
                    </select>
                </div>

                {error && <p className="error">{error}</p>}

                <Button type="submit" variant="primary" disabled={isLoading}>
                    {isLoading ? 'Creando...' : 'Crear categoría'}
                </Button>
            </form>
        </section>
    );
}
