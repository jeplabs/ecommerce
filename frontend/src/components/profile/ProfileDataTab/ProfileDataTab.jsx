import { useState } from 'react';
import { useProfile } from '../../../context/ProfileContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getInitials } from '../../../utils/formatters';
import './ProfileDataTab.css';

export default function ProfileDataTab() {
    const { profile } = useProfile();
    const { logout } = useAuth();
    const { showSuccess, showError } = useToast();

    const { usuario, saving, updatePerfil, fetchPerfil } = profile;

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', apellido: '', pais: '' });
    const [formError, setFormError] = useState(null);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
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
        fetchPerfil();
    };

    return (
        <section className="profile-data" aria-label="Datos personales">
            <ProfileHero usuario={usuario} isEditing={isEditing} />

            {!isEditing ? (
                <div className="profile-data__view">
                    <dl className="profile-data__grid">
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
                        <button type="button" className="profile-btn profile-btn--primary" onClick={startEditing}>
                            Editar perfil
                        </button>
                        <button type="button" className="profile-btn profile-btn--ghost" onClick={logout}>
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            ) : (
                <form className="profile-data__form" onSubmit={handleSubmit}>
                    <h3 className="profile-data__form-title">Editar datos</h3>
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
                        <button type="submit" className="profile-btn profile-btn--primary" disabled={saving}>
                            {saving ? 'Guardando…' : 'Guardar cambios'}
                        </button>
                        <button type="button" className="profile-btn profile-btn--secondary" onClick={handleCancel} disabled={saving}>
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}

function ProfileHero({ usuario, isEditing }) {
    return (
        <div className="profile-data__hero">
            <div className="profile-data__avatar" aria-hidden="true">
                {getInitials(usuario.nombre, usuario.apellido)}
            </div>
            <div className="profile-data__info">
                <h2 className="profile-data__name">{usuario.nombre} {usuario.apellido}</h2>
                <p className="profile-data__email">{usuario.email}</p>
                {!isEditing && (
                    <span className="profile-data__member-since">Cliente registrado</span>
                )}
            </div>
        </div>
    );
}
