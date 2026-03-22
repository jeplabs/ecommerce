import { useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from "../components/Navbar"
import { API_URL } from "../config/config";
import ProfileForm from '../components/ProfileForm';

export default function Profile() {

    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [msgExito, setMsgExito] = useState(null);

    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        const fetchUsuario = async () => {

            setLoading(true);
            setError(null);

            try {

                // Leer token del localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No estás autenticado');
                }
                
                // Obtener usuario
                const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
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
                    throw new Error('Error al obtener usuario');
                }

                // Guardar usuario en estado
                const data = await response.json();
                setUsuario(data);

            } catch (error) {
                // Muestra mensaje de error al usuario
                console.error('Error al obtener usuario', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUsuario();
    }, [navigate]);

    // Manejo de UI
    if (loading) return <><Navbar /><p className="loading">Cargando...</p></>;
    
    if (error) {
        return (
            <>
                <Navbar />
                <div className="loading">
                    <p style={{color: 'red'}}>Error: {error}</p>
                    <button onClick={() => navigate('/login')} className='btn-submit'>Ir al Login</button>
                </div>
            </>
        );
    }

    if (!usuario) return <><Navbar /><p></p></>;

    // Función para guardar los cambios en el backend
    const handleSaveProfile = async (datosActualizados) => {
        const token = localStorage.getItem('token');

        // Verificación extra por seguridad antes de guardar
        if (!token) {
            navigate('/login', { replace: true });
            throw new Error('Sesión expirada');
        }

        try {
        
            const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(datosActualizados),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login', { replace: true });
                    throw new Error('Sesión expirada');
                }
                const errData = await response.json();
                throw new Error(errData.message || 'Error al actualizar el perfil');
            }

            const usuarioActualizado = await response.json();
            setUsuario(usuarioActualizado); // Actualizamos el estado local con los nuevos datos
            setMsgExito('Perfil actualizado correctamente');
            setTimeout(() => setMsgExito(null), 3000); // Limpiar mensaje después de 3 seg
        } catch (error) {
            console.error(err);
            throw err;
        }
    };

    // const logout = () => {
    //     localStorage.removeItem('token');
    //     navigate('/login', { replace: true });
    // };

    return (
        <>
            <Navbar />

            <main className="profile-container form-box">

                <h1>Mi Perfil</h1>
                
                {loading && <p>Cargando...</p>}
                {msgExito && <p style={{ color: 'green', fontWeight: 'bold' }}>{msgExito}</p>}

                {/* Pasamos los datos y la función de guardar al componente formulario */}
                <ProfileForm 
                    user={usuario} 
                    onSave={handleSaveProfile}
                    onCancel={() => fetchUsuario()} // Recargar datos si cancela
                />
                <button 
                    className='btn-submit' 
                    onClick={logout}
                >
                    Cerrar sesión
                </button>
            </main>
        </>
    )
}