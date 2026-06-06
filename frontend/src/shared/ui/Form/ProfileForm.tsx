import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { UpdateProfileFormValues, UserApi } from '@/entities/user';

type ProfileFormProps = {
    user: UserApi;
    onSave: (datos: UpdateProfileFormValues) => Promise<void>;
    onCancel: () => void;
};

type ProfileFormData = UpdateProfileFormValues & {
    email: string;
    rol: string;
    id: number;
};

export default function ProfileForm({ user, onSave, onCancel }: ProfileFormProps) {
    const [formData, setFormData] = useState<ProfileFormData>({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        pais: user.pais || '',
        email: user.email || '',
        rol: user.rol || '',
        id: user.id || 0,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const datosParaEnviar: UpdateProfileFormValues = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                pais: formData.pais,
            };

            await onSave(datosParaEnviar);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    if (!isEditing) {
        return (
            <div className="profile-view form-box">
                <h2>Detalles del Usuario</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Nombre:</strong> {formData.nombre} {formData.apellido}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>País:</strong> {formData.pais}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Email:</strong> {formData.email}{' '}
                    <span style={{ fontSize: '0.8em', color: '#666' }}>(No editable)</span>
                </div>

                <button className="btn-submit" onClick={() => setIsEditing(true)}>
                    Editar Perfil
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="form-box">
            <h2>Editar Perfil</h2>

            {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

            <div>
                <label>Nombre:</label>
                <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label>Apellido:</label>
                <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label>País:</label>
                <input
                    type="text"
                    name="pais"
                    value={formData.pais}
                    onChange={handleChange}
                    required
                />
            </div>

            <div
                style={{
                    opacity: 0.6,
                    pointerEvents: 'none',
                }}
            >
                <label>Email:</label>
                <input type="email" value={formData.email} tabIndex={-1} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    className="btn-submit"
                    type="submit"
                    disabled={loading}
                    style={{ padding: '8px 16px', cursor: 'pointer' }}
                >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                    className="btn-submit"
                    type="button"
                    onClick={() => {
                        setIsEditing(false);
                        onCancel();
                    }}
                    disabled={loading}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
