import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { UserApi, UserRole } from '@/entities/user';
import styles from './AdminUsersTable.module.css';

const formatRol = (rol: UserRole | null | undefined): string => {
    if (!rol) return '—';
    if (rol === 'ROLE_ADMIN') return 'Administrador';
    if (rol === 'ROLE_CUSTOMER') return 'Cliente';
    return String(rol).replace(/^ROLE_/, '');
};

const getInitials = (nombre: string | undefined, apellido: string | undefined): string => {
    const n = (nombre || '').charAt(0);
    const a = (apellido || '').charAt(0);
    return `${n}${a}`.toUpperCase() || '?';
};

const getBadgeClass = (rol: UserRole | null | undefined) => {
    if (rol === 'ROLE_ADMIN') return styles.badgeAdmin;
    return styles.badgeCustomer;
};

type AdminUsersTableProps = {
    users: UserApi[];
    loading: boolean;
    error: string | null;
    desactivarUsuario: (id: number) => void;
    activarUsuario: (id: number) => void;
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
}: AdminUsersTableProps) {
    const navigate = useNavigate();

    const handleEdit = (id: number) => {
        navigate(`/admin/users/${id}/edit`);
    };

    const handleDesactivar = (user: UserApi) => {
        if (
            !window.confirm(
                `¿Desactivar la cuenta de ${user.nombre} ${user.apellido}? No podrá iniciar sesión hasta que un admin la reactive.`
            )
        ) {
            return;
        }
        desactivarUsuario(user.id);
    };

    const handleActivar = (user: UserApi) => {
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
            <div className={clsx(styles.state, styles.stateLoading)}>
                <p>Cargando usuarios…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={clsx(styles.state, styles.stateError)} role="alert">
                <p>{error}</p>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className={clsx(styles.state, styles.stateEmpty)}>
                <p>No hay usuarios registrados.</p>
            </div>
        );
    }

    return (
        <section className={styles.root} aria-label="Listado de usuarios">
            <header className={styles.toolbar}>
                <div>
                    <h2 className={styles.title}>Usuarios</h2>
                    <p className={styles.subtitle}>
                        {users.length} usuario{users.length !== 1 ? 's' : ''} en el sistema
                    </p>
                </div>
            </header>

            <div className={styles.scroll}>
                <table className={styles.grid}>
                    <thead>
                        <tr>
                            <th scope="col" className={styles.colUser}>Usuario</th>
                            <th scope="col" className={styles.colEmail}>Email</th>
                            <th scope="col">País</th>
                            <th scope="col" className={styles.colRole}>Rol</th>
                            <th scope="col">Estado</th>
                            <th scope="col" className={styles.colNumeric}>Intentos</th>
                            <th scope="col" className={styles.colActions}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className={styles.row}>
                                <td className={styles.cellUser} data-label="Usuario">
                                    <div className={styles.user}>
                                        <span className={styles.avatar} aria-hidden="true">
                                            {getInitials(user.nombre, user.apellido)}
                                        </span>
                                        <div className={styles.userText}>
                                            <span className={styles.name}>
                                                {user.nombre} {user.apellido}
                                            </span>
                                            <span className={styles.id}>ID {user.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.cellEmail} data-label="Email">
                                    {user.email}
                                </td>
                                <td data-label="País">{user.pais || '—'}</td>
                                <td
                                    className={styles.cellRole}
                                    data-label="Rol"
                                >
                                    <span className={clsx(styles.badge, getBadgeClass(user.rol))}>
                                        {formatRol(user.rol)}
                                    </span>
                                </td>
                                <td data-label="Estado">
                                    <div className={styles.statusWrap}>
                                        <span
                                            className={clsx(
                                                styles.pill,
                                                user.activo ? styles.pillOk : styles.pillOff
                                            )}
                                        >
                                            {user.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                        {user.bloqueado && (
                                            <span className={clsx(styles.pill, styles.pillWarn)}>
                                                Bloqueado
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td
                                    className={styles.cellNumeric}
                                    data-label="Intentos fallidos"
                                >
                                    {user.intentosFallidos ?? 0}
                                </td>
                                <td className={styles.cellActions} data-label="Acciones">
                                    <div className={styles.actions}>
                                        <button
                                            type="button"
                                            className={clsx(styles.btn, styles.btnSecondary)}
                                            onClick={() => handleEdit(user.id)}
                                        >
                                            Editar
                                        </button>
                                        {user.activo ? (
                                            <button
                                                type="button"
                                                className={clsx(styles.btn, styles.btnDanger)}
                                                onClick={() => handleDesactivar(user)}
                                            >
                                                Desactivar
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className={clsx(styles.btn, styles.btnPrimary)}
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
