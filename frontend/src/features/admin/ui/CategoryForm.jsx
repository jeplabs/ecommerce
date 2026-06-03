import { useState } from 'react';

export function CategoryForm({ categorias = [], onCreate, isLoading }) {
    const [nombre, setNombre] = useState('');
    const [parentId, setParentId] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!nombre.trim()) {
            setError('El nombre de la categoría es obligatorio');
            return;
        }

        const payload = {
            nombre: nombre.trim(),
            parentId: parentId ? Number(parentId) : null
        };

        try {
            await onCreate(payload);
            setNombre('');
            setParentId('');
        } catch (err) {
            setError(err.message || 'Error al crear la categoría');
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

                <button type="submit" className="btn-submit" disabled={isLoading}>
                    {isLoading ? 'Creando...' : 'Crear categoría'}
                </button>
            </form>
        </section>
    );
}
