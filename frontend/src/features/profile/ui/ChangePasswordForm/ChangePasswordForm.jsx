import { useState } from 'react';
import { useProfile, useToast } from '@/app/providers';
import { updatePasswordFormSchema } from '@/entities/user';

const EMPTY_FORM = {
    passwordActual: '',
    password: '',
    confirmarPassword: '',
};

export default function ChangePasswordForm() {
    const { profile } = useProfile();
    const { updatePassword } = profile;
    const { showSuccess, showError } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: null }));
        }
        if (formError) setFormError(null);
    };

    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setFieldErrors({});
        setFormError(null);
    };

    const handleCancel = () => {
        resetForm();
        setIsOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        const parsed = updatePasswordFormSchema.safeParse(formData);
        if (!parsed.success) {
            const errors = {};
            parsed.error.issues.forEach((issue) => {
                const field = issue.path[0];
                if (field && !errors[field]) {
                    errors[field] = issue.message;
                }
            });
            setFieldErrors(errors);
            return;
        }

        setIsSubmitting(true);
        const result = await updatePassword(parsed.data);
        setIsSubmitting(false);

        if (result.success) {
            showSuccess('Contraseña actualizada correctamente');
            resetForm();
            setIsOpen(false);
            return;
        }

        setFormError(result.error);
        showError(result.error);
    };

    if (!isOpen) {
        return (
            <section className="profile-data__password" aria-label="Cambiar contraseña">
                <h3 className="profile-data__form-title">Contraseña</h3>
                <p className="profile-data__password-hint">
                    Actualiza tu contraseña ingresando la actual y la nueva.
                </p>
                <div className="profile-data__actions">
                    <button
                        type="button"
                        className="profile-btn profile-btn--primary"
                        onClick={() => setIsOpen(true)}
                        >
                        Cambiar contraseña
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="profile-data__password" aria-label="Cambiar contraseña">
            <h3 className="profile-data__form-title">Cambiar contraseña</h3>

            <form className="profile-data__form" onSubmit={handleSubmit}>
                {formError && (
                    <p className="profile-data__error" role="alert">{formError}</p>
                )}

                <div className="profile-field">
                    <label htmlFor="passwordActual">Contraseña actual</label>
                    <input
                        id="passwordActual"
                        name="passwordActual"
                        type="password"
                        value={formData.passwordActual}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                        disabled={isSubmitting}
                    />
                    {fieldErrors.passwordActual && (
                        <span className="profile-data__field-error">{fieldErrors.passwordActual}</span>
                    )}
                </div>

                <div className="profile-field">
                    <label htmlFor="password">Nueva contraseña</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                        disabled={isSubmitting}
                    />
                    {fieldErrors.password && (
                        <span className="profile-data__field-error">{fieldErrors.password}</span>
                    )}
                </div>

                <div className="profile-field">
                    <label htmlFor="confirmarPassword">Confirmar nueva contraseña</label>
                    <input
                        id="confirmarPassword"
                        name="confirmarPassword"
                        type="password"
                        value={formData.confirmarPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                        disabled={isSubmitting}
                    />
                    {fieldErrors.confirmarPassword && (
                        <span className="profile-data__field-error">{fieldErrors.confirmarPassword}</span>
                    )}
                </div>

                <div className="profile-data__actions">
                    <button
                        type="submit"
                        className="profile-btn profile-btn--primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Actualizando…' : 'Actualizar contraseña'}
                    </button>
                    <button
                        type="button"
                        className="profile-btn profile-btn--secondary"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </section>
    );
}
