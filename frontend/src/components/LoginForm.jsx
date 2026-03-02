import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from "../config/config";

export default function LoginForm() {

    // Estado para almacenar el formulario de login
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Estado para almacenar el error de login
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
        throw new Error('Credenciales inválidas');
        }

        // Guarda el token
        const data = await response.json();
        localStorage.setItem('token', data.token); 

        // Redirige a la página principal o dashboard
        navigate('/profile'); 
        
    } catch (error) {
        // Muestra mensaje de error al usuario
        console.error('Error en el login', error);
        setError('Credenciales inválidas');
    }
    };
    return (
        <form onSubmit={handleSubmit}>

            {/* Input correo electrónico */}
            <label htmlFor="email">Correo electrónico</label>
            <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
            />
            {error && <span className="error">{error}</span>}

            {/* Input contraseña */}
            <label htmlFor="password">Contraseña</label>
            <input 
                type="password" 
                id="password" 
                name="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
            />
            {error && <span className="error">{error}</span>}

            <br />
            <button type="submit">Iniciar sesión</button>
        </form>
    )
}