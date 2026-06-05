import { useState } from 'react';
import { forgotPassword } from '@/entities/user/api/authApi';

export default function ForgotPasswordForm({ onBack, onSuccess }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await forgotPassword(email);
            setSuccess(true);
            setEmail('');
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || 'Error al solicitar recuperación de contraseña');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="form-box">
                <p className="form-sub">Revisa tu bandeja de entrada y sigue las instrucciones para recuperar tu contraseña.</p>
                <button type="button" className="btn-submit" onClick={onBack}>
                    Volver al login
                </button>
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
            <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar correo'}
            </button>
        </form>
    );
}
