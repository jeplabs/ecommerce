import { useNavigate } from 'react-router-dom';
import './AdminUsersTable.css';

const formatRol = (rol) => {
    if (!rol) return '—';
    if (rol === 'ROLE_ADMIN') return 'Administrador';
    if (rol === 'ROLE_CUSTOMER') return 'Cliente';
    return rol.replace(/^ROLE_/, '');
};

const getInitials = (nombre, apellido) => {
    const n = (nombre || '').charAt(0);
    const a = (apellido || '').charAt(0);
    return `${n}${a}`.toUpperCase() || '?';
};

/**
 * Tabla responsive de usuarios para el panel admin.
 * Desktop: tabla; móvil: filas tipo tarjeta (data-label).
 */
export default function AdminUsersTable({
    users,
    loading,
    error,
    desactivarUsuario,
    activarUsuario,
}) {
    const navigate = useNavigate();

    const handleEdit = (id) => {
        navigate(`/admin/users/${id}/edit`);
    };

    const handleDesactivar = (user) => {
        if (
            !window.confirm(
                `¿Desactivar la cuenta de ${user.nombre} ${user.apellido}? No podrá iniciar sesión hasta que un admin la reactive.`
            )
        ) {
            return;
        }
        desactivarUsuario(user.id);
    };

    const handleActivar = (user) => {
        if (
            !window.confirm(
                `¿Activar la cuenta de ${user.nombre} ${user.apellido}?`
            )
        ) {
            return;
        }
        activarUsuario(user.id);
    };

    if (loading) {
        return (
            <div className="admin-users-table__state admin-users-table__state--loading">
                <p>Cargando usuarios…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-users-table__state admin-users-table__state--error" role="alert">
                <p>{error}</p>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="admin-users-table__state admin-users-table__state--empty">
                <p>No hay usuarios registrados.</p>
            </div>
        );
    }

    return (
        <section className="admin-users-table" aria-label="Listado de usuarios">
            <header className="admin-users-table__toolbar">
                <div>
                    <h2 className="admin-users-table__title">Usuarios</h2>
                    <p className="admin-users-table__subtitle">
                        {users.length} usuario{users.length !== 1 ? 's' : ''} en el sistema
                    </p>
                </div>
            </header>

            <div className="admin-users-table__scroll">
                <table className="admin-users-table__grid">
                    <thead>
                        <tr>
                            <th scope="col" className="admin-users-table__col-user">Usuario</th>
                            <th scope="col" className="admin-users-table__col-email">Email</th>
                            <th scope="col">País</th>
                            <th scope="col" className="admin-users-table__col-role">Rol</th>
                            <th scope="col">Estado</th>
                            <th scope="col" className="admin-users-table__col-numeric">Intentos</th>
                            <th scope="col" className="admin-users-table__col-actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="admin-users-table__row">
                                <td className="admin-users-table__cell-user" data-label="Usuario">
                                    <div className="admin-users-table__user">
                                        <span className="admin-users-table__avatar" aria-hidden="true">
                                            {getInitials(user.nombre, user.apellido)}
                                        </span>
                                        <div className="admin-users-table__user-text">
                                            <span className="admin-users-table__name">
                                                {user.nombre} {user.apellido}
                                            </span>
                                            <span className="admin-users-table__id">ID {user.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="admin-users-table__cell-email" data-label="Email">
                                    {user.email}
                                </td>
                                <td data-label="País">{user.pais || '—'}</td>
                                <td
                                    className="admin-users-table__cell-role"
                                    data-label="Rol"
                                >
                                    <span
                                        className={`admin-users-table__badge admin-users-table__badge--${(user.rol || 'user').toLowerCase().replace('role_', '')}`}
                                    >
                                        {formatRol(user.rol)}
                                    </span>
                                </td>
                                <td data-label="Estado">
                                    <div className="admin-users-table__status-wrap">
                                        <span
                                            className={`admin-users-table__pill ${user.activo ? 'admin-users-table__pill--ok' : 'admin-users-table__pill--off'}`}
                                        >
                                            {user.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                        {user.bloqueado && (
                                            <span className="admin-users-table__pill admin-users-table__pill--warn">
                                                Bloqueado
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td
                                    className="admin-users-table__cell-numeric"
                                    data-label="Intentos fallidos"
                                >
                                    {user.intentosFallidos ?? 0}
                                </td>
                                <td className="admin-users-table__cell-actions" data-label="Acciones">
                                    <div className="admin-users-table__actions">
                                        <button
                                            type="button"
                                            className="admin-users-table__btn admin-users-table__btn--secondary"
                                            onClick={() => handleEdit(user.id)}
                                        >
                                            Editar
                                        </button>
                                        {user.activo ? (
                                            <button
                                                type="button"
                                                className="admin-users-table__btn admin-users-table__btn--danger"
                                                onClick={() => handleDesactivar(user)}
                                            >
                                                Desactivar
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="admin-users-table__btn admin-users-table__btn--primary"
                                                onClick={() => handleActivar(user)}
                                            >
                                                Activar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
