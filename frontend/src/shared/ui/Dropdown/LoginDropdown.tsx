import { useAuth } from '@/app/providers';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import ForgotPasswordForm from '@/shared/ui/Form/ForgotPasswordForm';
import { Button } from '@/shared/ui/Button';
import './LoginDropdown.css';

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
            <div className="dropdown-menu">
                <ForgotPasswordForm
                    onBack={() => setShowForgotPassword(false)}
                    onSuccess={handleForgotPasswordSuccess}
                />
            </div>
        );
    }

    return (
        <div className="dropdown-menu">
            <div className="dropdown-header">
                <span>Bienvenido de nuevo</span>
            </div>

            <form className="mini-login-form" onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    className="dropdown-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    className="dropdown-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                {error && <span className="dropdown-error">{error}</span>}

                <p className="form-sub">
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
            </form>

            <div className="dropdown-divider"></div>

            <div className="dropdown-footer">
                <span>¿No tienes cuenta?</span>
                <Link to="/register" className="btn-dropdown-register" onClick={onClose}>
                    Registrarse
                </Link>
            </div>
        </div>
    );
}
