import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import { useAdminUser } from '../../hooks/useAdminUser';
import './UserEdit.css';

const ROLES = [
    { value: 'ROLE_CUSTOMER', label: 'Cliente' },
    { value: 'ROLE_ADMIN', label: 'Administrador' },
];

export default function UserEdit() {
    const { id } = useParams();
    const { user, rol, setRol, loading, saving, updateRol } = useAdminUser(id);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateRol(rol);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="admin-user-edit">
                    <p className="admin-user-edit__loading">Cargando usuario…</p>
                </main>
            </>
        );
    }

    if (!user) return null;

    return (
        <>
            <Navbar />
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
                            onChange={(e) => setRol(e.target.value)}
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
        </>
    );
}
