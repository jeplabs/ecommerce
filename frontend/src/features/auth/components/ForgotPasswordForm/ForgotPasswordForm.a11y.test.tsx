import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import ForgotPasswordForm from './ForgotPasswordForm';

vi.mock('../../api/authApi', () => ({
    forgotPassword: vi.fn().mockResolvedValue({ message: 'Email enviado' }),
}));

describe('Accesibilidad — ForgotPasswordForm (Paso 5: Autenticación)', () => {
    it('el formulario de olvido de contraseña cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = render(
            <MemoryRouter>
                <ForgotPasswordForm onBack={vi.fn()} onSuccess={vi.fn()} />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
