import { useAuth } from '@/app/providers';
import { useState, useEffect } from 'react';


import { API_URL } from '@/shared/config';
import { redirectUnauthorized } from '@/shared/lib/http-session';

export default function AdminDashboardView({ onNavigate }) {
        const [usuarios, setUsuarios] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const { logout } = useAuth();

        useEffect(() => {
            const token = localStorage.getItem('token');

            if (!token) {
                onNavigate('/login', { replace: true });
                return;
            }

            const fetchUsuarios = async () => {
                setLoading(true);
                setError(null);

                try {

                    // Leer token del localStorage
                    // const token = localStorage.getItem('token');
                    // if (!token) {
                        // throw new Error('No estás autenticado');
                    // }
                    
                    const response = await fetch(`${API_URL}/api/auth/usuarios`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        if (redirectUnauthorized(response.status, onNavigate)) {
                            return;
                        }
                        throw new Error('Error al obtener usuarios');
                    }

                    // Guardar usuarios en estado
                    const data = await response.json();
                    setUsuarios(data);

                } catch (error) {
                    // Muestra mensaje de error al usuario
                    console.error('Error al obtener usuarios', error);
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchUsuarios();
        }, [onNavigate]);

        // useEffect(() => {
        //     fetchUsuarios();
        // }, []);
        
        // Manejo de UI mientras carga o hay error
        if (loading && usuarios.length === 0) {
            return <p className='loading'>Cargando...</p>;
        }

        if (error) {
            onNavigate('/', { replace: true });
        }
        //logout();
        // const logout = () => {
        //     navigate('/', { replace: true });
        // };

    return (
        <main className="admin-container">
                <h1>Admin</h1>
                
                <button type="button" className='btn-submit' onClick={() => onNavigate('/admin/users')}>
                    Usuarios
                </button>
                <button type="button" className='btn-submit' onClick={() => onNavigate('/admin/products')}>
                    Productos
                </button>
                <button type="button" className='btn-submit' onClick={() => onNavigate('/admin/orders')}>
                    Pedidos
                </button>

                <button 
                    onClick={logout}
                    className='btn-submit'
                >
                    Cerrar sesión
                </button>
            </main>
    );
}