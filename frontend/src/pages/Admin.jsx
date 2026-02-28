import { useState, useEffect } from 'react';
import Navbar from "../components/Navbar"
import { API_URL } from "../config/config";

export default function Admin() {

        const [usuarios, setUsuarios] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);

        const fetchUsuarios = async () => {

            setLoading(true);
            setError(null);

            try {

                // Leer token del localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No estás autenticado');
                }
                
                const response = await fetch(`${API_URL}/api/auth/usuarios`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
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

        useEffect(() => {
            fetchUsuarios();
        }, []);

    return (
        <>
            <Navbar />
            <h1>Admin</h1>
            <div className="usuarios-list">
                <h2>Lista de usuarios</h2>
                
                {loading && <p>Cargando...</p>}
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
        </>
    );
}