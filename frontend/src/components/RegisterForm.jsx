import { useState } from "react"
import { API_URL } from "../config/config";

export default function RegisterForm({ onRegisterSuccess }) {
    // Estado para almacenar los datos del formulario, errores y estado de carga
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        pais: "",
        email: "",
        password: "",
        confirmarPassword: "",
    })

    // Estado para almacenar los errores del formulario
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    // Funcion para validar la contraseña
    const validatePassword = (password) => {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
        //return hasMinLength && hasUpperCase && hasNumber;
    }

    // Función para validar el correo electrónico
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Función para manejar los cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        // Validar que el correo sea válido
        if (!validateEmail(formData.email)) {
            newErrors.email = "Correo inválido";
        }

        // Validar que la contraseña sea de 8 caracteres, incluir mayúsculas y minúsculas, y incluir números
        if (!validatePassword(formData.password)) {
            newErrors.password = "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales";
        }

        // Validar que las contraseñas coincidan
        if (formData.password !== formData.confirmarPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden";
        }

        // Si hay algún error, mostrarlo
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Mostrar que se está registrando
        setLoading(true);

        try {
            // Enviar el formulario a API
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                if (response.status === 400 && data.message?.includes("email")) {
                    setErrors({ email: 'El correo ya está registrado' });
                    setLoading(false);
                    return;
                } 
                throw new Error("Error en el registro");
            }

            // Guardar el token en localStorage y redireccionar a login
            const data = await response.json();
            //localStorage.setItem("token", data.token);
            onRegisterSuccess();
        } catch (error) {
            console.error('Error en el registro', error);
            setErrors({ email: 'Error en el registro' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>

            {/* Input nombre */}
            <label htmlFor="nombre">Nombre</label>
            <input 
                type="text" 
                name="nombre" 
                id="nombre"
                value={formData.nombre}
                onChange={handleChange} 
                required
            />
            {/* Mostrar errores si hay alguno */}
            {errors.nombre && <span className="error">{errors.nombre}</span>}
            
            {/* Input apellido */}
            <label htmlFor="apellido">Apellido</label>
            <input 
                type="text" 
                name="apellido"
                id="apellido"
                value={formData.apellido}
                onChange={handleChange} 
                required
            />
            {/* Mostrar errores si hay alguno */}
            {errors.apellido && <span className="error">{errors.apellido}</span>}

            {/* Input pais */}
            <label htmlFor="pais">País</label>
            <input 
                type="text" 
                name="pais" 
                id="pais"
                value={formData.pais}
                onChange={handleChange} 
                required
            />
            {/* Mostrar errores si hay alguno */}
            {errors.pais && <span className="error">{errors.pais}</span>}

            {/* Input correo electrónico */}
            <label htmlFor="email">Correo electrónico</label>
            <input 
                type="email" 
                name="email" 
                id="email"
                value={formData.email}
                onChange={handleChange} 
                required
            />
            {/* Mostrar errores si hay alguno */}
            {errors.email && <span className="error">{errors.email}</span>}

            {/* Input contraseña */}
            <label htmlFor="password">Contraseña</label>
            <input 
                type="password" 
                id="password" 
                name="password" 
                value={formData.password}
                onChange={handleChange} 
                required
            />
            {/* Mostrar errores si hay alguno */}
            {errors.password && <span className="error">{errors.password}</span>}

            {/* Input confirmar contraseña */}
            <label htmlFor="confirmarPassword">Confirmar contraseña</label>
            <input 
                type="password" 
                id="confirmarPassword" 
                name="confirmarPassword" 
                value={formData.confirmarPassword}
                onChange={handleChange} 
                required
            />
            {/* Mostrar errores si hay alguno */}
            {errors.confirmarPassword && <span className="error">{errors.confirmarPassword}</span>}

            {errors.general && <span className="error">{errors.general}</span>}
            <br />

            {/* Botón de enviar */}
            <button type="submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
            </button>
        </form>
    )
}