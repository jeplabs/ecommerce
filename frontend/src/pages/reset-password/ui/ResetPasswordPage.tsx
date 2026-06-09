import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '@/entities/user/api/authApi';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form/Form';
import formStyles from '@/shared/ui/Form/Form.module.css';
import { FieldError, FormField } from '@/shared/ui/FormField';
import { Input } from '@/shared/ui/Input';
import styles from '@/pages/login/ui/LoginPage.module.css';

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [formData, setFormData] = useState({ password: '', confirmarPassword: '' });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { password, confirmarPassword } = formData;

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            setIsLoading(false);
            return;
        }

        if (password !== confirmarPassword) {
            setError('Las contraseñas no coinciden');
            setIsLoading(false);
            return;
        }

        if (!token) {
            setError('Token inválido o inexistente');
            setIsLoading(false);
            return;
        }

        try {
            await resetPassword(token, password, confirmarPassword);
            setSuccess(true);
            setFormData({ password: '', confirmarPassword: '' });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al restablecer contraseña';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className={styles.authPage}>
                <h1>Token inválido</h1>
                <p className={formStyles.sub}>El enlace de recuperación es inválido o ha expirado.</p>
                <Button type="button" variant="primary" fullWidth onClick={() => navigate('/login')}>
                    Volver al login
                </Button>
            </div>
        );
    }

    if (success) {
        return (
            <div className={styles.authPage}>
                <h1>Contraseña restablecida</h1>
                <p className={formStyles.sub}>Tu contraseña ha sido actualizada. Ya puedes iniciar sesión con tu nueva contraseña.</p>
                <Button type="button" variant="primary" fullWidth onClick={() => navigate('/login')}>
                    Ir a iniciar sesión
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.authPage}>
            <h1>Restablecer contraseña</h1>
            <Form variant="auth" onSubmit={handleSubmit}>
                <FormField label="Nueva contraseña" htmlFor="password">
                    <Input
                        type="password"
                        id="password"
                        name="password"
                        withIconPadding
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        minLength={8}
                    />
                </FormField>

                <FormField label="Confirmar contraseña" htmlFor="confirmarPassword">
                    <Input
                        type="password"
                        id="confirmarPassword"
                        name="confirmarPassword"
                        withIconPadding
                        value={formData.confirmarPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        minLength={8}
                    />
                </FormField>

                {error && <FieldError>{error}</FieldError>}

                <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
                    {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                </Button>

                <p className={formStyles.sub}>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/login');
                        }}
                    >
                        Cancelar
                    </a>
                </p>
            </Form>
        </div>
    );
}

export default ResetPasswordPage;
