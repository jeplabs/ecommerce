import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import LoginDropdown from './LoginDropdown';

vi.mock('@/app/providers', () => ({
    useAuth: () => ({
        login: vi.fn().mockResolvedValue({ success: true }),
    }),
}));

describe('Accesibilidad — LoginDropdown (Paso 5: Autenticación)', () => {
    it('el menú desplegable de login cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = render(
            <MemoryRouter>
                <LoginDropdown onClose={vi.fn()} />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
