import { useState } from "react"

export default function RegisterForm() {
    // Estado para almacenar los datos del formulario, errores y estado de carga
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    // Estado para almacenar los errores del formulario
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    // Funcion para validar la contraseña
    const validatePassword = (password, confirmPassword) => {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        return hasMinLength && hasUpperCase && hasNumber;
    }

    // Función para validar el correo electrónico
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Función para manejar los cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...prev, [name]: value });

        if (errors[name]) {
            setErrors({ ...prev, [name]: '' });
        }
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        // Validaciones de campos obligatorios
        if (!validateEmail(formData.email)) {
            newErrors.email = "Correo inválido";
        }

        if (!validatePassword(formData.password, formData.confirmPassword)) {
            newErrors.password = "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas y minúsculas, y incluir números";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            // Enviar el formulario a API
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                if (data.errors == 'EMAIL_EXISTS') {
                    setErrors({ email: 'El correo ya está registrado' });
                    setLoading(false);
                    return;
                } 
                throw new Error("Error en el registro");
            }

            // Guardar el token en localStorage y redireccionar a login
            const data = await response.json();
            localStorage.setItem("token", data.token);
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
            <label for="name">Nombre</label>
            <input 
                type="text" 
                name="name" 
                id="name"
                value={formData.name}
                onChange={handleChange} 
                required
            />
            {/* Mostrar errores si hay alguno */}
            {errors.name && <span className="error">{errors.name}</span>}

            {/* Input correo electrónico */}
            <label for="email">Correo electrónico</label>
            <input 
                type="email" 
                name="email" 
                id="email"
                //value={formData.email}
                onChange={handleChange} 
                required
            />
            {/* Mostrar errores si hay alguno */}
            {errors.email && <span className="error">{errors.email}</span>}

            {/* Input contraseña */}
            <label for="password">Contraseña</label>
            <input 
                type="password" 
                id="password" 
                name="password" 
                onChange={handleChange} 
                required
            />
            {/* Mostrar errores si hay alguno */}
            {errors.password && <span className="error">{errors.password}</span>}

            {/* Input confirmar contraseña */}
            <label for="confirmPassword">Confirmar contraseña</label>
            <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                onChange={handleChange} 
                required
            />
            {/* Mostrar errores si hay alguno */}
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

            {errors.general && <span className="error">{errors.general}</span>}
            <br />

            {/* Botón de enviar */}
            <button type="submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
            </button>
        </form>
    )
}