import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/providers', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/app/providers')>();
    return {
        ...mod,
        CheckoutProvider: ({ children }: { children: React.ReactNode }) => (
            <div>{children}</div>
        ),
    };
});

vi.mock('@/features/checkout/ui/CheckoutContent/CheckoutContent', () => ({
    default: () => <div>checkout-content</div>,
}));

vi.mock('@/widgets/checkout/CheckoutPageHeader', () => ({
    default: () => <div>page-header</div>,
}));

import { CheckoutPage } from './CheckoutPage';

describe('CheckoutPage', () => {
    it('renderiza el header y el contenido del checkout', () => {
        render(<CheckoutPage />);

        expect(screen.getByText('page-header')).toBeInTheDocument();
        expect(screen.getByText('checkout-content')).toBeInTheDocument();
    });
});
