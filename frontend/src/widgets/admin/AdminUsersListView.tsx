import { useAuth, useToast } from '@/app/providers';
import { Link } from 'react-router-dom';
import AdminUsersTable from '@/features/admin/ui/AdminUsersTable/AdminUsersTable';
import { useAdminUsersList } from '@/features/admin';
import styles from './AdminUsersListView.module.css';

export default function AdminUsersListView() {
    const { users, setUsers, loading, error } = useAdminUsersList();
    const { desactivarUsuario, activarUsuario } = useAuth();
    const { showSuccess, showError } = useToast();

    const handleActivarUsuario = async (userId: number) => {
        const resultado = await activarUsuario(userId);

        if (resultado.success) {
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, activo: true } : user
                )
            );
            showSuccess('Usuario activado');
        } else {
            showError(resultado.error || 'No se pudo activar');
        }
    };

    const handleDesactivarUsuario = async (userId: number) => {
        const resultado = await desactivarUsuario(userId);

        if (resultado.success) {
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, activo: false } : user
                )
            );
            showSuccess('Usuario desactivado');
        } else {
            showError(resultado.error || 'No se pudo desactivar');
        }
    };

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <div>
                    <Link to="/admin" className={styles.back}>
                        ← Volver al panel
                    </Link>
                    <h1>Gestión de usuarios</h1>
                    <p className={styles.lead}>
                        Altas, estado de cuenta y roles del sistema
                    </p>
                </div>
            </header>

            <AdminUsersTable
                users={users}
                loading={loading}
                error={error}
                desactivarUsuario={handleDesactivarUsuario}
                activarUsuario={handleActivarUsuario}
            />
        </main>
    );
}
