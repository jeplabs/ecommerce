import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import LoginForm from './LoginForm';

vi.mock('@/app/providers', () => ({
    useAuth: () => ({
        login: vi.fn().mockResolvedValue({ success: true }),
    }),
}));

describe('Accesibilidad — LoginForm (Paso 5: Autenticación)', () => {
    it('el formulario de login cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = render(
            <MemoryRouter>
                <LoginForm />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
