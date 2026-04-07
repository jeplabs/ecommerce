import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../components/layout/Navbar/Navbar";
import { API_URL } from "../../config/config";
import UsersTable from "../../components/admin/UsersTable";
import { useAuth } from "../../context/AuthContext";

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { desactivarUsuario, activarUsuario } = useAuth();

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
                        'Authorization': `Bearer ${token}`,
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

    // --- NUEVAS FUNCIONES WRAPPER ---
    // Estas funciones ejecutan la acción Y LUEGO actualizan la lista visualmente
    const handleActivarUsuario = async (userId) => {
        const resultado = await activarUsuario(userId);
        
        if (resultado.success) {
            // Actualizamos el estado local inmediatamente sin recargar toda la página
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, activo: true } : user
                )
            );
        } else {
            alert(`Error: ${resultado.error}`);
        }
    };

    const handleDesactivarUsuario = async (userId) => {

        const resultado = await desactivarUsuario(userId);
        
        if (resultado.success) {
            // Actualizamos el estado local inmediatamente
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, activo: false } : user
                )
            );
        } else {
            alert(`Error: ${resultado.error}`);
        }
    };
    // -------------------------------

    return (
        <>
            <Navbar />
            <main className="admin-container">
                <h1>Gestión de Usuarios</h1>

                {/* Pasamos las NUEVAS funciones wrapper en lugar de las del contexto directo */}
                <UsersTable 
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