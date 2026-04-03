import { useState } from "react"
import { useAuth } from "../../../context/AuthContext";

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

    const { register } = useAuth();
    
    // Funcion para validar la contraseña
    const validatePassword = (password) => {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
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

        // Limpiar el error específico del campo que se está editando
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        
        // Validacion Nombre
        if (!formData.nombre || formData.nombre.trim() === "") {
            newErrors.nombre = "El nombre es obligatorio";
        } else if (formData.nombre.length < 2 || formData.nombre.length > 100) {
            newErrors.nombre = "El nombre debe tener entre 2 y 100 caracteres";
        }

        // Validacion Apellido
        if (!formData.apellido || formData.apellido.trim() === "") {
            newErrors.apellido = "El apellido es obligatorio";
        } else if (formData.apellido.length < 2 || formData.apellido.length > 100) {
            newErrors.apellido = "El apellido debe tener entre 2 y 100 caracteres";
        }

        // Validacion País
        if (!formData.pais || formData.pais.trim() === "") {
            newErrors.pais = "El pais es obligatorio";
        } else if (formData.pais.length < 2 || formData.pais.length > 100) {
            newErrors.pais = "El país debe tener entre 2 y 100 caracteres";
        }

        // Validacion Email
        if (!formData.email || formData.email.trim() === "") {
            newErrors.email = "El email es obligatorio";
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Formato de email inválido";
        }

        // Validacion Password
        if (!formData.password || formData.password.trim() === "") {
            newErrors.password = "La contraseña es obligatoria";
        } else if (formData.password.length < 8) {
            newErrors.password = "La contraseña debe tener al menos 8 caracteres";
        } else if (!validatePassword(formData.password)) {
            newErrors.password = "La contraseña debe tener al menos una mayúscula, un número y un carácter especial";
        }

        // Validacion Confirmar Password
        if (!formData.confirmarPassword || formData.confirmarPassword.trim() === "") {
            newErrors.confirmarPassword = "Debes confirmar la contraseña";
        } else if (formData.password !== formData.confirmarPassword) {
            newErrors.confirmarPassword = "Las contraseñas no coinciden";
        }

        // if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio y debe tener entre 2 y 100 caracteres";
        // if (!formData.apellido.trim()) newErrors.apellido = "El apellido es obligatorio y debe tener entre 2 y 100 caracteres";
        // if (!formData.pais.trim()) newErrors.pais = "El país es obligatorio y debe tener entre 2 y 100 caracteres";
        // if (!validateEmail(formData.email)) newErrors.email = "Correo inválido";
        // if (!validatePassword(formData.password)) newErrors.password = "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial";
        // if (formData.password !== formData.confirmarPassword) newErrors.confirmarPassword = "No coinciden las contraseñas";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        // Limpiar errores previos
        setErrors({}); 

        const result = await register(formData);
        setLoading(false);

        if (result.success) {
            setFormData({ nombre: "", apellido: "", pais: "", email: "", password: "", confirmarPassword: "" });
            onRegisterSuccess();
        } else {
            // Si el backend devolvió errores por campo (varios)
            if (result.fields) {
                setErrors(result.fields); // ¡Pinta todos los errores a la vez!
            } 
            // Si el backend devolvió un solo campo (compatibilidad)
            else if (result.field) {
                setErrors({ [result.field]: result.error });
            } 
            // Error general
            else {
                setErrors({ general: result.error });
            }
        }
    };

    return (
        <form className="form-box" onSubmit={handleSubmit}>

            {/* Input nombre */}
            <label htmlFor="nombre">Nombre</label>
            <input 
                type="text" 
                name="nombre" 
                id="nombre"
                value={formData.nombre}
                onChange={handleChange} 
                //required
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
                // required
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
                // required
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
                // required
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
                // required
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
                // required
            />
            {/* Mostrar errores si hay alguno */}
            {errors.confirmarPassword && <span className="error">{errors.confirmarPassword}</span>}

            {errors.general && <span className="error">{errors.general}</span>}
            <br />

            {/* Botón de enviar */}
            <button className="btn-submit" type="submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
            </button>
            
        </form>
    )
}