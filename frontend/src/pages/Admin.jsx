import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar"
import { API_URL } from "../config/config";
import { ProductForm } from '../components/ProductForm';

export default function Admin() {

        const [usuarios, setUsuarios] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const navigate = useNavigate();

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
        const logout = () => {
            localStorage.removeItem('token');
            navigate('/', { replace: true });
        };

    return (
        <>
            <Navbar />
            <main className="admin-container">
                <h1>Admin</h1>
                <div className="usuarios-list">
                    <h2>Lista de usuarios</h2>
                    <br />
                    {loading && <div className="loading">
                        <p>Cargando...</p>
                    </div>}
                    {error && <p className="error">{error}</p>}
                    {!loading && usuarios.length === 0 && <p>No hay usuarios registrados</p>}
                    {!loading && usuarios.length > 0 && 
                        <ul>
                            {usuarios.map((usuario) => (
                                <li key={usuario.id}>
                                    <strong>{usuario.nombre} {usuario.apellido}</strong>
                                    <br />
                                    <small>{usuario.email}</small>
                                    <br />
                                    <small>{usuario.pais}</small>
                                    <br />
                                    <small>{usuario.rol}</small>
                                </li>
                            ))}
                        </ul>
                    }
                </div>
                <button 
                    onClick={logout}
                    className='btn-submit'
                >
                    Cerrar sesión
                </button>
            <ProductForm />
            </main>
        </>
    );
}