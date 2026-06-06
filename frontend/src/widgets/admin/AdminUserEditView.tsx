import { Link } from 'react-router-dom';
import type { UserRole } from '@/entities/user';
import { useAdminUser } from '@/features/admin';
import './AdminUserEditView.css';

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
            <main className="admin-user-edit">
                <p className="admin-user-edit__loading">Cargando usuario…</p>
            </main>
        );
    }

    if (!user) return null;

    return (
        <main className="admin-user-edit">
            <Link to="/admin/users" className="admin-user-edit__back">
                ← Volver a usuarios
            </Link>
            <h1>Editar usuario</h1>
            <p className="admin-user-edit__lead">
                {user.nombre} {user.apellido} ·{' '}
                <span className="admin-user-edit__mono">{user.email}</span>
            </p>

            <div className="admin-user-edit__card">
                <dl className="admin-user-edit__meta">
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

                <form className="admin-user-edit__form" onSubmit={handleSubmit}>
                    <label className="admin-user-edit__label" htmlFor="user-rol">
                        Rol en el sistema
                    </label>
                    <select
                        id="user-rol"
                        className="admin-user-edit__select"
                        value={rol}
                        onChange={(e) => setRol(e.target.value as UserRole)}
                    >
                        {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="admin-user-edit__submit"
                        disabled={saving || rol === user.rol}
                    >
                        {saving ? 'Guardando…' : 'Guardar rol'}
                    </button>
                </form>
            </div>
        </main>
    );
}
