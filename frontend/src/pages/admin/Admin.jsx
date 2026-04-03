import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from "../../components/layout/Navbar/Navbar";
import { API_URL } from "../../config/config";

export default function Admin() {

        const [usuarios, setUsuarios] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const navigate = useNavigate();
        const { logout } = useAuth();

        useEffect(() => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login', { replace: true });
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
                        if (response.status === 401) {
                            localStorage.removeItem('token');
                            navigate('/login', { replace: true });
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
        }, [navigate]);

        // useEffect(() => {
        //     fetchUsuarios();
        // }, []);
        
        // Manejo de UI mientras carga o hay error
        if (loading && usuarios.length === 0) {
            return <><Navbar /><p className='loading'>Cargando...</p></>;
        }

        if (error) {
            navigate('/', { replace: true });
        }
        //logout();
        // const logout = () => {
        //     navigate('/', { replace: true });
        // };

    return (
        <>
            <Navbar />
            <main className="admin-container">
                <h1>Admin</h1>
                
                <button className='btn-submit' onClick={() => navigate('/admin/users')}>
                    Usuarios
                </button>
                <button className='btn-submit' onClick={() => navigate('/admin/products')}>
                    Productos
                </button>
                
                <button 
                    onClick={logout}
                    className='btn-submit'
                >
                    Cerrar sesión
                </button>
            </main>
        </>
    );
}