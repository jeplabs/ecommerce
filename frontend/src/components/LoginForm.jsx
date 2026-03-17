import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {

    // Estado para almacenar el formulario de login
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Estado para almacenar el error de login
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { login } = useAuth();

    // Maneja el cambio en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Actualizar el valor del campo
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar el error si el usuario empieza a escribir de nuevo
        if (error) {
            setError(null);
        }
    };
    
    // Maneja el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = formData;
        const result = await login(email, password);

        if (result.success) {
            //Lógica de redirección según el rol
            if (result.rol === 'ROLE_ADMIN') {
                navigate('/admin');
            } else {
                //Para USER o cualquier otro rol
                navigate('/profile');
            }
        } else {
            setError(result.error);
        }
    };

    return (
        <form className='form-box' onSubmit={handleSubmit}>

            {/* Input correo electrónico */}
            <label htmlFor="email">Correo electrónico</label>
            <input 
                className='login-input'
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                required
            />
            {error && <span className="error">{error}</span>}

            {/* Input contraseña */}
            <label htmlFor="password">Contraseña</label>
            <input 
                className='login-input'
                type="password" 
                id="password" 
                name="password" 
                value={formData.password}
                onChange={handleChange}
                required
            />
            {error && <span className="error">{error}</span>}

            <br />
            <button className='btn-submit' type="submit">Iniciar sesión</button>
        </form>
    )
}