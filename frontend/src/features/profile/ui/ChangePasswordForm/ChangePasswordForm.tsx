import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useProfile, useToast } from '@/app/providers';
import { updatePasswordFormSchema } from '@/entities/user';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { Input } from '@/shared/ui/Input';

const EMPTY_FORM = {
    passwordActual: '',
    password: '',
    confirmarPassword: '',
};

type PasswordFormData = typeof EMPTY_FORM;
type PasswordField = keyof PasswordFormData;

export default function ChangePasswordForm() {
    const { profile } = useProfile();
    const { updatePassword } = profile;
    const { showSuccess, showError } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<PasswordFormData>(EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<PasswordField, string | null>>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const field = name as PasswordField;
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: null }));
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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);

        const parsed = updatePasswordFormSchema.safeParse(formData);
        if (!parsed.success) {
            const errors: Partial<Record<PasswordField, string>> = {};
            parsed.error.issues.forEach((issue) => {
                const field = issue.path[0] as PasswordField;
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
                    <Button type="button" variant="primary" onClick={() => setIsOpen(true)}>
                        Cambiar contraseña
                    </Button>
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

                <FormField
                    label="Contraseña actual"
                    htmlFor="passwordActual"
                    error={fieldErrors.passwordActual}
                >
                    <Input
                        id="passwordActual"
                        name="passwordActual"
                        type="password"
                        value={formData.passwordActual}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                        disabled={isSubmitting}
                        invalid={!!fieldErrors.passwordActual}
                    />
                </FormField>

                <FormField label="Nueva contraseña" htmlFor="password" error={fieldErrors.password}>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                        disabled={isSubmitting}
                        invalid={!!fieldErrors.password}
                    />
                </FormField>

                <FormField
                    label="Confirmar nueva contraseña"
                    htmlFor="confirmarPassword"
                    error={fieldErrors.confirmarPassword}
                >
                    <Input
                        id="confirmarPassword"
                        name="confirmarPassword"
                        type="password"
                        value={formData.confirmarPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                        disabled={isSubmitting}
                        invalid={!!fieldErrors.confirmarPassword}
                    />
                </FormField>

                <div className="profile-data__actions">
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Actualizando…' : 'Actualizar contraseña'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                </div>
            </form>
        </section>
    );
}
