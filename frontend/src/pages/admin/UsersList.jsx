import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import { API_URL } from '../../config/config';
import AdminUsersTable from '../../components/admin/AdminUsersTable/AdminUsersTable';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './UsersList.css';

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { desactivarUsuario, activarUsuario } = useAuth();
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_URL}/api/auth/usuarios`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('token');
                        navigate('/login', { replace: true });
                        return;
                    }
                    throw new Error('Error al obtener usuarios');
                }

                const data = await response.json();
                setUsers(data);
            } catch (err) {
                console.error('Error al obtener usuarios', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [navigate]);

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
