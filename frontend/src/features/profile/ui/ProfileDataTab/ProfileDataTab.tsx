import { useProfile, useAuth, useToast } from '@/app/providers';
import { useState, type ChangeEvent, type FormEvent } from 'react';

import { getInitials } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { Input } from '@/shared/ui/Input';
import type { UserApi } from '@/entities/user';
import ChangePasswordForm from '../ChangePasswordForm/ChangePasswordForm';
import styles from './ProfileDataTab.module.css';

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
        <section className={styles.root} aria-label="Datos personales">
            <ProfileHero usuario={usuario} />
            <div className={styles.content}>

            {!isEditing ? (
                <div>
                    <dl className={styles.grid}>
                        <h3 className="profile-data__section-title">Información personal</h3>
                        <div className={styles.field}>
                            <dt>Nombre completo</dt>
                            <dd>{usuario.nombre} {usuario.apellido}</dd>
                        </div>
                        <div className={styles.field}>
                            <dt>País</dt>
                            <dd>{usuario.pais}</dd>
                        </div>
                        <div className={styles.field}>
                            <dt>Correo electrónico</dt>
                            <dd>
                                {usuario.email}
                                <span className={styles.badge}>No editable</span>
                            </dd>
                        </div>
                    </dl>

                    <div className={styles.actions}>
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
                <form className={styles.form} onSubmit={handleSubmit}>
                    <h3 className="">Editar datos</h3>
                    {formError && <p className={styles.error} role="alert">{formError}</p>}

                    <div className={styles.formRow}>
                        <FormField label="Nombre" htmlFor="nombre">
                            <Input
                                id="nombre"
                                name="nombre"
                                type="text"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </FormField>
                        <FormField label="Apellido" htmlFor="apellido">
                            <Input
                                id="apellido"
                                name="apellido"
                                type="text"
                                value={formData.apellido}
                                onChange={handleChange}
                                required
                            />
                        </FormField>
                    </div>

                    <FormField label="País" htmlFor="pais">
                        <Input
                            id="pais"
                            name="pais"
                            type="text"
                            value={formData.pais}
                            onChange={handleChange}
                            required
                        />
                    </FormField>

                    <FormField label="Correo electrónico" htmlFor="email" readonly>
                        <Input id="email" type="email" value={usuario.email} disabled tabIndex={-1} />
                    </FormField>

                    <div className={styles.actions}>
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
        <div className={styles.hero}>
            <div className={styles.avatar} aria-hidden="true">
                {getInitials(usuario.nombre, usuario.apellido)}
            </div>
            <div>
                <h2 className={styles.name}>{usuario.nombre} {usuario.apellido}</h2>
                <p className={styles.email}>{usuario.email}</p>
                <span className={styles.memberSince}>Cliente registrado</span>
            </div>
        </div>
    );
}
