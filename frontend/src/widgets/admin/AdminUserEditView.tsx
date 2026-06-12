import { Link } from 'react-router-dom';
import type { UserRole } from '@/entities/user';
import { useAdminUser } from '@/features/admin';
import { Select } from '@/shared/ui/Select';
import styles from './AdminUserEditView.module.css';

const ROLES: { value: UserRole; label: string }[] = [
    { value: 'ROLE_CUSTOMER', label: 'Cliente' },
    { value: 'ROLE_ADMIN', label: 'Administrador' },
];

type AdminUserEditViewProps = {
    userId: string | number;
};

export default function AdminUserEditView({ userId }: AdminUserEditViewProps) {
    const { user, rol, setRol, loading, saving, updateRol } = useAdminUser(userId);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (rol) {
            await updateRol(rol);
        }
    };

    if (loading) {
        return (
            <main className={styles.root}>
                <p className={styles.loading}>Cargando usuario…</p>
            </main>
        );
    }

    if (!user) return null;

    return (
        <main className={styles.root}>
            <Link to="/admin/users" className={styles.back}>
                ← Volver a usuarios
            </Link>
            <h1>Editar usuario</h1>
            <p className={styles.lead}>
                {user.nombre} {user.apellido} ·{' '}
                <span className={styles.mono}>{user.email}</span>
            </p>

            <div className={styles.card}>
                <dl className={styles.meta}>
                    <div>
                        <dt>País</dt>
                        <dd>{user.pais || '—'}</dd>
                    </div>
                    <div>
                        <dt>Estado</dt>
                        <dd>
                            {user.activo ? 'Activo' : 'Inactivo'}
                            {user.bloqueado ? ' · Bloqueado' : ''}
                        </dd>
                    </div>
                    <div>
                        <dt>Intentos fallidos</dt>
                        <dd>{user.intentosFallidos ?? 0}</dd>
                    </div>
                </dl>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.label} htmlFor="user-rol">
                        Rol en el sistema
                    </label>
                    <Select
                        id="user-rol"
                        className={styles.select}
                        value={rol}
                        onChange={(e) => setRol(e.target.value as UserRole)}
                    >
                        {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </Select>
                    <button
                        type="submit"
                        className={styles.submit}
                        disabled={saving || rol === user.rol}
                    >
                        {saving ? 'Guardando…' : 'Guardar rol'}
                    </button>
                </form>
            </div>
        </main>
    );
}
