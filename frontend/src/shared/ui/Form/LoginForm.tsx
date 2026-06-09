import { useAuth } from '@/app/providers';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form/Form';
import formStyles from '@/shared/ui/Form/Form.module.css';
import { FieldError, FormField } from '@/shared/ui/FormField';
import { Input } from '@/shared/ui/Input';
import ForgotPasswordForm from './ForgotPasswordForm';

type LoginFormData = {
    email: string;
    password: string;
};

export default function LoginForm() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) {
            setError(null);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { email, password } = formData;
        const result = await login(email, password);

        if (result.success) {
            if (result.rol === 'ROLE_ADMIN') {
                navigate('/admin');
            } else {
                navigate('/profile');
            }
        } else {
            setError(result.error);
        }
    };

    if (showForgotPassword) {
        return (
            <ForgotPasswordForm
                onBack={() => setShowForgotPassword(false)}
                onSuccess={() => setShowForgotPassword(false)}
            />
        );
    }

    return (
        <Form variant="auth" onSubmit={handleSubmit}>
            <FormField label="Correo electrónico" htmlFor="email">
                <Input
                    withIconPadding
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </FormField>

            <FormField label="Contraseña" htmlFor="password">
                <Input
                    withIconPadding
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </FormField>

            {error && <FieldError>{error}</FieldError>}

            <p className={formStyles.sub}>
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setShowForgotPassword(true);
                    }}
                >
                    ¿Olvidaste tu contraseña?
                </a>
            </p>

            <Button type="submit" variant="primary" fullWidth>
                Iniciar sesión
            </Button>
        </Form>
    );
}
