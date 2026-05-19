import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import AdminUsersTable from '../../components/admin/AdminUsersTable/AdminUsersTable';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAdminUsersList } from '../../hooks/useAdminUsersList';
import './UsersList.css';

export default function UsersList() {
    const { users, setUsers, loading, error } = useAdminUsersList();
    const { desactivarUsuario, activarUsuario } = useAuth();
    const { showSuccess, showError } = useToast();

    const handleActivarUsuario = async (userId) => {
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

    const handleDesactivarUsuario = async (userId) => {
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
        <>
            <Navbar />
            <main className="admin-users-page">
                <header className="admin-users-page__header">
                    <div>
                        <Link to="/admin" className="admin-users-page__back">
                            ← Volver al panel
                        </Link>
                        <h1>Gestión de usuarios</h1>
                        <p className="admin-users-page__lead">
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
        </>
    );
}
