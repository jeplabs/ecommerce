import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ResetPasswordForm } from './ResetPasswordForm';

vi.mock('../../api/authApi', () => ({
    resetPassword: vi.fn().mockResolvedValue({ message: 'Contraseña restablecida' }),
}));

describe('Accesibilidad — ResetPasswordForm (Paso 5: Autenticación)', () => {
    it('el formulario de restablecimiento de contraseña con token válido cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/reset-password?token=valid-token-123']}>
                <ResetPasswordForm />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('la vista de token inválido o inexistente cumple con las normas de accesibilidad', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/reset-password']}>
                <ResetPasswordForm />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
