import { useProfile, useAuth, useToast } from '@/app/providers';
import { useState, type ChangeEvent, type FormEvent } from 'react';

import { getInitials } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import type { UserApi } from '@/entities/user';
import ChangePasswordForm from '../ChangePasswordForm/ChangePasswordForm';
import './ProfileDataTab.css';

type ProfileFormData = {
    nombre: string;
    apellido: string;
    pais: string;
};

export default function ProfileDataTab() {
    const { profile } = useProfile();
    const { logout } = useAuth();
    const { showSuccess, showError } = useToast();

    const { usuario, saving, updatePerfil } = profile;

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<ProfileFormData>({ nombre: '', apellido: '', pais: '' });
    const [formError, setFormError] = useState<string | null>(null);

    if (!usuario) return null;

    const startEditing = () => {
        setFormData({
            nombre: usuario.nombre || '',
            apellido: usuario.apellido || '',
            pais: usuario.pais || '',
        });
        setFormError(null);
        setIsEditing(true);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);

        const result = await updatePerfil({
            nombre: formData.nombre,
            apellido: formData.apellido,
            pais: formData.pais,
        });

        if (result.success) {
            showSuccess('Perfil actualizado correctamente');
            setIsEditing(false);
        } else {
            setFormError(result.error);
            showError(result.error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormError(null);
    };

    return (
        <section className="profile-data" aria-label="Datos personales">
            <ProfileHero usuario={usuario} />
            <div className="profile-data__content">

            {!isEditing ? (
                <div className="profile-data__view">
                    <dl className="profile-data__grid">
                        <h3 className="profile-data__section-title">Información personal</h3>
                        <div className="profile-data__field">
                            <dt>Nombre completo</dt>
                            <dd>{usuario.nombre} {usuario.apellido}</dd>
                        </div>
                        <div className="profile-data__field">
                            <dt>País</dt>
                            <dd>{usuario.pais}</dd>
                        </div>
                        <div className="profile-data__field">
                            <dt>Correo electrónico</dt>
                            <dd>
                                {usuario.email}
                                <span className="profile-data__badge">No editable</span>
                            </dd>
                        </div>
                    </dl>

                    <div className="profile-data__actions">
                        <Button type="button" variant="primary" onClick={startEditing}>
                            Editar perfil
                        </Button>
                        <Button type="button" variant="ghost" onClick={logout}>
                            Cerrar sesión
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                <form className="profile-data__form" onSubmit={handleSubmit}>
                    <h3 className="">Editar datos</h3>
                    {formError && <p className="profile-data__error" role="alert">{formError}</p>}

                    <div className="profile-data__form-row">
                        <div className="profile-field">
                            <label htmlFor="nombre">Nombre</label>
                            <input id="nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} required />
                        </div>
                        <div className="profile-field">
                            <label htmlFor="apellido">Apellido</label>
                            <input id="apellido" name="apellido" type="text" value={formData.apellido} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="profile-field">
                        <label htmlFor="pais">País</label>
                        <input id="pais" name="pais" type="text" value={formData.pais} onChange={handleChange} required />
                    </div>

                    <div className="profile-field profile-field--readonly">
                        <label htmlFor="email">Correo electrónico</label>
                        <input id="email" type="email" value={usuario.email} disabled tabIndex={-1} />
                    </div>

                    <div className="profile-data__actions">
                        <Button type="submit" variant="primary" disabled={saving}>
                            {saving ? 'Guardando…' : 'Guardar cambios'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
                            Cancelar
                        </Button>
                    </div>
                </form>

                </>
            )}
            <ChangePasswordForm />
            </div>
        </section>
    );
}

type ProfileHeroProps = {
    usuario: UserApi;
};

function ProfileHero({ usuario }: ProfileHeroProps) {
    return (
        <div className="profile-data__hero">
            <div className="profile-data__avatar" aria-hidden="true">
                {getInitials(usuario.nombre, usuario.apellido)}
            </div>
            <div className="profile-data__info">
                <h2 className="profile-data__name">{usuario.nombre} {usuario.apellido}</h2>
                <p className="profile-data__email">{usuario.email}</p>
                <span className="profile-data__member-since">Cliente registrado</span>
            </div>
        </div>
    );
}
