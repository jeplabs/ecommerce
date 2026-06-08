import { useAuth } from '@/app/providers';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { RegisterFormValues } from '@/entities/user';
import { Button } from '@/shared/ui/Button';

type RegisterFormProps = {
    onRegisterSuccess: () => void;
};

type RegisterFormErrors = Partial<Record<keyof RegisterFormValues | 'general', string>>;

export default function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
    const [formData, setFormData] = useState<RegisterFormValues>({
        nombre: '',
        apellido: '',
        pais: '',
        email: '',
        password: '',
        confirmarPassword: '',
    });

    const [errors, setErrors] = useState<RegisterFormErrors>({});
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();

    const validatePassword = (password: string) => {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name as keyof RegisterFormErrors]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newErrors: RegisterFormErrors = {};

        if (!formData.nombre || formData.nombre.trim() === '') {
            newErrors.nombre = 'El nombre es obligatorio';
        } else if (formData.nombre.length < 2 || formData.nombre.length > 100) {
            newErrors.nombre = 'El nombre debe tener entre 2 y 100 caracteres';
        }

        if (!formData.apellido || formData.apellido.trim() === '') {
            newErrors.apellido = 'El apellido es obligatorio';
        } else if (formData.apellido.length < 2 || formData.apellido.length > 100) {
            newErrors.apellido = 'El apellido debe tener entre 2 y 100 caracteres';
        }

        if (!formData.pais || formData.pais.trim() === '') {
            newErrors.pais = 'El pais es obligatorio';
        } else if (formData.pais.length < 2 || formData.pais.length > 100) {
            newErrors.pais = 'El país debe tener entre 2 y 100 caracteres';
        }

        if (!formData.email || formData.email.trim() === '') {
            newErrors.email = 'El email es obligatorio';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Formato de email inválido';
        }

        if (!formData.password || formData.password.trim() === '') {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        } else if (!validatePassword(formData.password)) {
            newErrors.password =
                'La contraseña debe tener al menos una mayúscula, un número y un carácter especial';
        }

        if (!formData.confirmarPassword || formData.confirmarPassword.trim() === '') {
            newErrors.confirmarPassword = 'Debes confirmar la contraseña';
        } else if (formData.password !== formData.confirmarPassword) {
            newErrors.confirmarPassword = 'Las contraseñas no coinciden';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        const result = await register(formData);
        setLoading(false);

        if (result.success) {
            setFormData({
                nombre: '',
                apellido: '',
                pais: '',
                email: '',
                password: '',
                confirmarPassword: '',
            });
            onRegisterSuccess();
        } else {
            if (result.fields) {
                setErrors(result.fields);
            } else if (result.field) {
                setErrors({ [result.field]: result.error });
            } else {
                setErrors({ general: result.error });
            }
        }
    };

    return (
        <form className="form-box" onSubmit={handleSubmit}>
            <label htmlFor="nombre">Nombre</label>
            <input
                type="text"
                name="nombre"
                id="nombre"
                value={formData.nombre}
                onChange={handleChange}
            />
            {errors.nombre && <span className="error">{errors.nombre}</span>}

            <label htmlFor="apellido">Apellido</label>
            <input
                type="text"
                name="apellido"
                id="apellido"
                value={formData.apellido}
                onChange={handleChange}
            />
            {errors.apellido && <span className="error">{errors.apellido}</span>}

            <label htmlFor="pais">País</label>
            <input
                type="text"
                name="pais"
                id="pais"
                value={formData.pais}
                onChange={handleChange}
            />
            {errors.pais && <span className="error">{errors.pais}</span>}

            <label htmlFor="email">Correo electrónico</label>
            <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}

            <label htmlFor="password">Contraseña</label>
            <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
            />
            {errors.password && <span className="error">{errors.password}</span>}

            <label htmlFor="confirmarPassword">Confirmar contraseña</label>
            <input
                type="password"
                id="confirmarPassword"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
            />
            {errors.confirmarPassword && (
                <span className="error">{errors.confirmarPassword}</span>
            )}

            {errors.general && <span className="error">{errors.general}</span>}
            <br />

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
        </form>
    );
}
