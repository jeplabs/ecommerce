import { useState, type ChangeEvent, type FormEvent } from 'react';
import { forgotPassword } from '@/entities/user/api/authApi';
import { Button } from '@/shared/ui/Button';

type ForgotPasswordFormProps = {
    onBack: () => void;
    onSuccess?: () => void;
};

export default function ForgotPasswordForm({ onBack, onSuccess }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError(null);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await forgotPassword(email);
            setSuccess(true);
            setEmail('');
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Error al solicitar recuperación de contraseña'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="form-box">
                <p className="form-sub">
                    Revisa tu bandeja de entrada y sigue las instrucciones para recuperar tu
                    contraseña.
                </p>
                <Button type="button" variant="primary" fullWidth onClick={onBack}>
                    Volver al login
                </Button>
            </div>
        );
    }

    return (
        <form className="form-box" onSubmit={handleSubmit}>
            <p className="form-sub">
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        onBack();
                    }}
                >
                    ← Volver al login
                </a>
            </p>

            <label htmlFor="forgot-email">Correo electrónico</label>
            <input
                type="email"
                id="forgot-email"
                name="email"
                className="login-input"
                value={email}
                onChange={handleChange}
                required
                disabled={isLoading}
            />

            {error && <span className="error">{error}</span>}

            <br />
            <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar correo'}
            </Button>
        </form>
    );
}
