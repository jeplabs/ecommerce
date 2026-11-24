import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CheckoutContent from './CheckoutContent';
import { makeCheckoutMock } from '@/test/checkoutMock';

vi.mock('@/app/providers/useCheckout', () => ({
    useCheckout: vi.fn(),
}));

vi.mock('@/app/providers/useToast', () => ({
    useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}));

import { useCheckout } from '@/app/providers/useCheckout';

const useCheckoutMock = vi.mocked(useCheckout);

describe('Accesibilidad — CheckoutContent (Paso 4: Carrito y Checkout)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('el paso de revisión y envío cumple con las normas de accesibilidad de axe-core', async () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ currentStep: 'envio', step: 1 }) as never
        );

        const { container } = render(
            <MemoryRouter>
                <CheckoutContent />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('el paso de selección de método de pago cumple con las normas de accesibilidad', async () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ currentStep: 'pago', step: 2 }) as never
        );

        const { container } = render(
            <MemoryRouter>
                <CheckoutContent />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
