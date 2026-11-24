import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import Navbar from './Navbar';
import { AppProviders } from '@/app/providers/AppProviders';

function renderWithProviders(ui: ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <AppProviders>{ui}</AppProviders>
        </MemoryRouter>
    );
}

describe('Accesibilidad — Navbar (Paso 1: Layout Público)', () => {
    it('el componente Navbar cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = renderWithProviders(<Navbar />);

        expect(screen.getByRole('navigation')).toBeInTheDocument();

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
