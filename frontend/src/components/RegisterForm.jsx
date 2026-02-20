import { useState } from "react"

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    const validatePassword = (password, confirmPassword) => {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        return hasMinLength && hasUpperCase && hasNumber;
    }

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...prev, [name]: value });

        if (errors[name]) {
            setErrors({ ...prev, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

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
            const response = await fetch("/api/register", {
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
            <label for="email">Correo electrónico</label>
            <input 
                type="email" 
                name="email" 
                id=""
                //value={formData.email}
                onChange={handleChange} 
                required
            />
            {errors.email && <span className="error">{errors.email}</span>}

            <label for="password">Contraseña</label>
            <input 
                type="password" 
                id="password" 
                name="password" 
                onChange={handleChange} 
                required
            />
            {errors.password && <span className="error">{errors.password}</span>}

            <label for="confirmPassword">Confirmar contraseña</label>
            <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                onChange={handleChange} 
                required
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

            {errors.general && <span className="error">{errors.general}</span>}
            <br />
            <button type="submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
            </button>
        </form>
    )
}