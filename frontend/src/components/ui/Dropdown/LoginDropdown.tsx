import { useAuth } from '@/app/providers';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import ForgotPasswordForm from '@/shared/ui/Form/ForgotPasswordForm';
import { Form } from '@/shared/ui/Form/Form';
import formStyles from '@/shared/ui/Form/Form.module.css';
import { Button } from '@/shared/ui/Button';
import { FieldError } from '@/shared/ui/FormField';
import { Input } from '@/shared/ui/Input';
import styles from './LoginDropdown.module.css';

type LoginDropdownProps = {
    onClose?: () => void;
};

type LoginFormData = {
    email: string;
    password: string;
};

export default function LoginDropdown({ onClose }: LoginDropdownProps) {
    const { login } = useAuth();
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError(null);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { email, password } = formData;

        const result = await login(email, password);

        setIsLoading(false);

        if (result.success) {
            setFormData({ email: '', password: '' });
            if (onClose) {
                onClose();
            }
        } else {
            setError(result.error || 'Error al iniciar sesión');
        }
    };

    const handleForgotPasswordSuccess = () => {
        setShowForgotPassword(false);
        setFormData({ email: '', password: '' });
        setError(null);
    };

    if (showForgotPassword) {
        return (
            <div className={styles.menu}>
                <ForgotPasswordForm
                    onBack={() => setShowForgotPassword(false)}
                    onSuccess={handleForgotPasswordSuccess}
                />
            </div>
        );
    }

    return (
        <div className={styles.menu}>
            <div className={styles.header}>
                <span>Bienvenido de nuevo</span>
            </div>

            <Form className={styles.loginForm} onSubmit={handleSubmit}>
                <Input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    className={styles.input}
                    value={formData.email}
                    onChange={handleChange}
                    invalid={!!error}
                    required
                />
                <Input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    className={styles.input}
                    value={formData.password}
                    onChange={handleChange}
                    invalid={!!error}
                    required
                />

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

                <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
                    {isLoading ? 'Cargando...' : 'Entrar'}
                </Button>
            </Form>

            <div className={styles.divider} />

            <div className={styles.footer}>
                <span>¿No tienes cuenta?</span>
                <Link to="/register" className={styles.registerLink} onClick={onClose}>
                    Registrarse
                </Link>
            </div>
        </div>
    );
}
