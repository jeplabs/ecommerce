import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/useScrollToTopOnPageChange', () => ({
    scrollToTopSmooth: vi.fn(),
}));

import { scrollToTopSmooth } from '@/shared/lib/useScrollToTopOnPageChange';
import RedirectToQPayPro from './RedirectToQPayPro';

const scrollMock = vi.mocked(scrollToTopSmooth);

describe('RedirectToQPayPro', () => {
    const originalLocation = window.location;
    let assignedHref = '';

    beforeEach(() => {
        assignedHref = '';
        scrollMock.mockReset();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                ...originalLocation,
                get href() {
                    return assignedHref;
                },
                set href(val: string) {
                    assignedHref = val;
                },
            },
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: originalLocation,
        });
        vi.restoreAllMocks();
    });

    it('muestra la marca, el badge de Guatemala y el mensaje de redirección', () => {
        render(<RedirectToQPayPro redirectUrl="https://sandboxpayments.qpaypro.com/pay?t=123" />);

        expect(screen.getByText('QPayPro')).toBeInTheDocument();
        expect(screen.getByText('Pasarela segura · Guatemala')).toBeInTheDocument();
        expect(
            screen.getByText('Redirigiendo al sitio seguro de QPayPro para completar tu pago…')
        ).toBeInTheDocument();
    });

    it('hace scroll arriba y asigna window.location.href a la redirectUrl', () => {
        const target = 'https://sandboxpayments.qpaypro.com/pay?t=xyz';
        render(<RedirectToQPayPro redirectUrl={target} />);

        expect(scrollMock).toHaveBeenCalledTimes(1);
        expect(assignedHref).toBe(target);
    });
});
