import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import PickupBranchSelector from './PickupBranchSelector';
import { makeCheckoutMock } from '@/test/checkoutMock';

vi.mock('@/app/providers/useCheckout', () => ({
    useCheckout: vi.fn(),
}));

import { useCheckout } from '@/app/providers/useCheckout';

const useCheckoutMock = vi.mocked(useCheckout);

describe('Accesibilidad — PickupBranchSelector (Paso 4: Carrito y Checkout)', () => {
    it('el selector de sucursales con grupo de radios cumple con las normas de accesibilidad de axe-core', async () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ selectedBranchId: 1 }) as never
        );

        const { container } = render(<PickupBranchSelector />);

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('el estado de carga cumple con las normas de accesibilidad', async () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ loadingBranches: true, sucursales: [] }) as never
        );

        const { container } = render(<PickupBranchSelector />);

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
