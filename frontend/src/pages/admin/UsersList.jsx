import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../components/Navbar";
import { API_URL } from "../../config/config";
import UsersTable from "../../components/UsersTable";

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Verificación de seguridad al montar
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        // 2. Función para obtener datos
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

    return (
        <>
            <Navbar />
            <main className="admin-container">
                    <h1>Gestión de Usuarios</h1>

                {/* Pasamos los datos y estados al componente tabla */}
                <UsersTable 
                    users={users} 
                    loading={loading} 
                    error={error} 
                />
            </main>
        </>
    );
}