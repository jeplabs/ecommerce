import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { UpdateProfileFormValues, UserApi } from '@/entities/user';
import { Button } from '@/shared/ui/Button';
import formStyles from '@/shared/ui/Form/Form.module.css';
import { Form } from '@/shared/ui/Form/Form';
import { FieldError, FormField } from '@/shared/ui/FormField';
import { Input } from '@/shared/ui/Input';
import clsx from 'clsx';

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
            <div className={clsx('profile-view', formStyles.form, formStyles.auth)}>
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

                <Button type="button" variant="primary" onClick={() => setIsEditing(true)}>
                    Editar Perfil
                </Button>
            </div>
        );
    }

    return (
        <Form variant="auth" onSubmit={handleSubmit}>
            <h2>Editar Perfil</h2>

            {error && <FieldError>{error}</FieldError>}

            <FormField label="Nombre" htmlFor="nombre">
                <Input
                    type="text"
                    name="nombre"
                    id="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />
            </FormField>

            <FormField label="Apellido" htmlFor="apellido">
                <Input
                    type="text"
                    name="apellido"
                    id="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                />
            </FormField>

            <FormField label="País" htmlFor="pais">
                <Input
                    type="text"
                    name="pais"
                    id="pais"
                    value={formData.pais}
                    onChange={handleChange}
                    required
                />
            </FormField>

            <FormField label="Email" htmlFor="email" readonly>
                <Input type="email" id="email" value={formData.email} tabIndex={-1} disabled />
            </FormField>

            <div style={{ display: 'flex', gap: '10px' }}>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                        setIsEditing(false);
                        onCancel();
                    }}
                    disabled={loading}
                >
                    Cancelar
                </Button>
            </div>
        </Form>
    );
}
