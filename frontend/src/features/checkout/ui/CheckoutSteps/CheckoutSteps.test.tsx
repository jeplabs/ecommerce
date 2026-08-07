import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CheckoutSteps from './CheckoutSteps';
import { CHECKOUT_STEPS, CHECKOUT_STEP_LABELS } from '@/features/checkout/model/checkoutSteps';

describe('CheckoutSteps', () => {
    it('marca el paso activo con aria-current y el índice', () => {
        render(<CheckoutSteps steps={CHECKOUT_STEPS} currentIndex={1} />);

        expect(screen.getByLabelText('Pasos del checkout')).toBeInTheDocument();
        expect(screen.getByText('Pedido y envío')).toBeInTheDocument();
        expect(screen.getByText('Pago')).toBeInTheDocument();
        expect(screen.getByText('Confirmación')).toBeInTheDocument();

        const activeItem = screen.getByText('Pago').closest('li');
        expect(activeItem).toHaveAttribute('aria-current', 'step');
    });

    it('marca pasos anteriores como completados (✓)', () => {
        render(<CheckoutSteps steps={CHECKOUT_STEPS} currentIndex={1} />);

        const li = screen.getByText('Pedido y envío').closest('li')!;
        expect(li.textContent).toContain('✓');
    });

    it('con markCurrentComplete marca el paso actual como completado', () => {
        render(
            <CheckoutSteps steps={CHECKOUT_STEPS} currentIndex={2} markCurrentComplete />
        );

        const last = screen.getByText('Confirmación').closest('li')!;
        expect(last.textContent).toContain('✓');
        expect(last).not.toHaveAttribute('aria-current');
    });

    it('muestra el número sin check cuando no está completado', () => {
        render(<CheckoutSteps steps={CHECKOUT_STEPS} currentIndex={0} />);

        const first = screen.getByText('Pedido y envío').closest('li')!;
        expect(first.textContent).toContain('1');
        expect(first.textContent).not.toContain('✓');
    });

    it('usa la etiqueta del paso desde CHECKOUT_STEP_LABELS', () => {
        render(<CheckoutSteps steps={['exito']} currentIndex={0} />);
        expect(screen.getByText(CHECKOUT_STEP_LABELS.exito)).toBeInTheDocument();
    });
});
