import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/providers', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/app/providers')>();
    return {
        ...mod,
        useCheckout: vi.fn(),
    };
});

import { useCheckout } from '@/app/providers';
import PaymentStep from './PaymentStep';
import { makeCheckoutMock } from '@/test/checkoutMock';
import { mockShippingServices } from '@/test/msw/fixtures/shipping';
import { PAYMENT_METHODS } from '@/features/checkout';
import { formatCurrency } from '@/shared/lib/format';

const useCheckoutMock = vi.mocked(useCheckout);

describe('PaymentStep', () => {
    it('muestra el total y los métodos de pago disponibles', async () => {
        const user = userEvent.setup();
        const setPaymentMethod = vi.fn();
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ orderTotal: 250, setPaymentMethod }) as never
        );
        render(<PaymentStep />);

        expect(screen.getByText(/Total a pagar:/)).toBeInTheDocument();
        expect(screen.getByText(formatCurrency(250))).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /QPayPro/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Webpay Plus/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Transferencia bancaria/ })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Webpay Plus/ }));
        expect(setPaymentMethod).toHaveBeenCalledWith(PAYMENT_METHODS.WEBPAY);

        await user.click(screen.getByRole('button', { name: /QPayPro/ }));
        expect(setPaymentMethod).toHaveBeenCalledWith(PAYMENT_METHODS.QPAYPRO);

        await user.click(screen.getByRole('button', { name: /Transferencia bancaria/ }));
        expect(setPaymentMethod).toHaveBeenCalledWith(PAYMENT_METHODS.BANK_TRANSFER);
    });

    it('muestra contra entrega y su formulario', async () => {
        const user = userEvent.setup();
        const setPaymentMethod = vi.fn();
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ setPaymentMethod }) as never
        );
        render(<PaymentStep />);

        const contra = screen.getByRole('button', { name: /Contra entrega/ });
        expect(contra).toBeInTheDocument();

        await user.click(contra);
        expect(setPaymentMethod).toHaveBeenCalledWith(PAYMENT_METHODS.CONTRA_ENTREGA);

        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                paymentMethod: PAYMENT_METHODS.CONTRA_ENTREGA,
                setPaymentMethod,
            }) as never
        );
        render(<PaymentStep />);
        expect(screen.getByText(/El cobro se realiza al entregar el pedido/)).toBeInTheDocument();
    });

    it('oculta contra entrega y muestra la nota para envío express', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                selectedServicio: mockShippingServices[2],
            }) as never
        );
        render(<PaymentStep />);

        expect(screen.queryByRole('button', { name: /Contra entrega/ })).not.toBeInTheDocument();
        expect(screen.getByText('No aplica para contra entrega')).toBeInTheDocument();
    });

    it('muestra la nota de transferencia bancaria y su formulario', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ paymentMethod: PAYMENT_METHODS.BANK_TRANSFER }) as never
        );
        render(<PaymentStep />);

        expect(screen.getByText(/Con transferencia el pedido queda pendiente/)).toBeInTheDocument();
        expect(screen.getByText(/Transfiere o deposita el monto total/)).toBeInTheDocument();
    });

    it('muestra la nota de redirección de Webpay', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ paymentMethod: PAYMENT_METHODS.WEBPAY }) as never
        );
        render(<PaymentStep />);

        expect(
            screen.getByText(/Serás redirigido al sitio seguro de/)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Al confirmar serás redirigido al sitio seguro de/)
        ).toBeInTheDocument();
    });

    it('muestra la nota genérica para QPayPro', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ paymentMethod: PAYMENT_METHODS.QPAYPRO }) as never
        );
        render(<PaymentStep />);

        expect(
            screen.getByText(/El pago es simulado en este entorno/)
        ).toBeInTheDocument();
    });
});
