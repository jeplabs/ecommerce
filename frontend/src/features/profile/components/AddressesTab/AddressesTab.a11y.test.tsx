import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders, ProfileProvider } from '@/app/providers';
import AddressesTab from './AddressesTab';
import AddressForm from '../AddressForm/AddressForm';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { mockAddresses } from '@/test/msw/fixtures/addresses';

function Wrapper({ children }: { children: ReactNode }) {
    return (
        <MemoryRouter initialEntries={['/profile/direcciones']}>
            <AppProviders>
                <ProfileProvider>{children}</ProfileProvider>
            </AppProviders>
        </MemoryRouter>
    );
}

describe('Accesibilidad — AddressesTab y AddressForm', () => {
    beforeEach(() => {
        setAccessToken(mockAuthTokenResponse.token);
        localStorage.setItem('has_session', '1');
        localStorage.setItem('rol', 'ROLE_CUSTOMER');
    });

    it('cumple con WCAG 2.1 AA en el listado de direcciones guardadas', async () => {
        const { container } = render(<AddressesTab />, { wrapper: Wrapper });

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 2, name: /mis direcciones/i })).toBeInTheDocument();
        });

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('cumple con WCAG 2.1 AA cuando se abre el formulario de nueva dirección', async () => {
        const user = userEvent.setup();
        const { container } = render(<AddressesTab />, { wrapper: Wrapper });

        const addBtn = await screen.findByRole('button', { name: /\+ nueva dirección/i });
        await user.click(addBtn);

        expect(screen.getByLabelText(/alias/i)).toBeInTheDocument();

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('cumple con WCAG 2.1 AA en AddressForm aislado con datos iniciales', async () => {
        const { container } = render(
            <AppProviders>
                <AddressForm
                    initialData={mockAddresses[0]}
                    onSubmit={vi.fn().mockResolvedValue({ success: true })}
                    onCancel={vi.fn()}
                    saving={false}
                />
            </AppProviders>
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
