import { useState, useEffect } from 'react';
import Navbar from "../components/Navbar"
import { API_URL } from "../config/config";

export default function Profile() {

    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUsuario = async () => {

        setLoading(true);
        setError(null);

        try {

            // Leer token del localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No estás autenticado');
            }

            // Leer userId del localStorage (debes guardarlo en el login)
            const userId = localStorage.getItem('id');
            if (!userId) {
                throw new Error('ID de usuario no encontrado');
            }
            
            // Obtener usuario
            const response = await fetch(`${API_URL}/api/auth/usuario/${usuario.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
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

    useEffect(() => {
        fetchUsuario();
    }, []);

    return (
        <>
            <Navbar />

            <main className="profile-container">

                <h1>Perfil</h1>

                {loading && <p>Cargando...</p>}
                {error && <p className="error">{error}</p>}

                {!loading && usuario && 
                    <div>
                        <h2>Bienvenido, {usuario.nombre}!</h2>
                        <p><strong>Email:</strong> {usuario.email}</p>
                    </div>
                }
            </main>
        </>
    )
}