import { useAuth } from '@/app/providers';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { RegisterFormValues } from '@/entities/user';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form/Form';
import { FieldError, FormField } from '@/shared/ui/FormField';
import { Input } from '@/shared/ui/Input';

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
        <Form variant="auth" onSubmit={handleSubmit}>
            <FormField label="Nombre" htmlFor="nombre" error={errors.nombre}>
                <Input
                    type="text"
                    name="nombre"
                    id="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    invalid={!!errors.nombre}
                />
            </FormField>

            <FormField label="Apellido" htmlFor="apellido" error={errors.apellido}>
                <Input
                    type="text"
                    name="apellido"
                    id="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    invalid={!!errors.apellido}
                />
            </FormField>

            <FormField label="País" htmlFor="pais" error={errors.pais}>
                <Input
                    type="text"
                    name="pais"
                    id="pais"
                    value={formData.pais}
                    onChange={handleChange}
                    invalid={!!errors.pais}
                />
            </FormField>

            <FormField label="Correo electrónico" htmlFor="email" error={errors.email}>
                <Input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    invalid={!!errors.email}
                />
            </FormField>

            <FormField label="Contraseña" htmlFor="password" error={errors.password}>
                <Input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    invalid={!!errors.password}
                />
            </FormField>

            <FormField
                label="Confirmar contraseña"
                htmlFor="confirmarPassword"
                error={errors.confirmarPassword}
            >
                <Input
                    type="password"
                    id="confirmarPassword"
                    name="confirmarPassword"
                    value={formData.confirmarPassword}
                    onChange={handleChange}
                    invalid={!!errors.confirmarPassword}
                />
            </FormField>

            {errors.general && <FieldError>{errors.general}</FieldError>}

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
        </Form>
    );
}
