import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import RegisterForm from './RegisterForm';

vi.mock('@/app/providers', () => ({
    useAuth: () => ({
        register: vi.fn().mockResolvedValue({ success: true }),
    }),
}));

describe('Accesibilidad — RegisterForm (Paso 5: Autenticación)', () => {
    it('el formulario de registro cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = render(
            <MemoryRouter>
                <RegisterForm onRegisterSuccess={vi.fn()} />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
