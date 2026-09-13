import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/app/providers', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/app/providers')>();
    return {
        ...mod,
        useCheckout: vi.fn(),
        useToast: vi.fn(),
    };
});

vi.mock('react-router-dom', async (importOriginal) => {
    const mod = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...mod,
        useNavigate: () => navigateMock,
    };
});

vi.mock('../RedirectToWebpay/RedirectToWebpay', () => ({
    default: ({ urlRedireccion, token }: { urlRedireccion: string; token: string }) => (
        <div data-testid="redirect-webpay">
            {urlRedireccion} / {token}
        </div>
    ),
}));

import { useCheckout, useToast } from '@/app/providers';
import CheckoutContent from './CheckoutContent';
import { makeCheckoutMock } from '@/test/checkoutMock';
import { PAYMENT_METHODS } from '@/features/checkout';

const useCheckoutMock = vi.mocked(useCheckout);
const useToastMock = vi.mocked(useToast);

const navigateMock = vi.fn();

function renderCheckout() {
    return render(
        <MemoryRouter>
            <CheckoutContent />
        </MemoryRouter>
    );
}

const baseResult = {
    success: true,
    needsRedirect: false,
    isBankTransfer: false,
    orden: { id: 1 },
    payment: null,
};

function mockToast() {
    const showSuccess = vi.fn();
    const showError = vi.fn();
    useToastMock.mockReturnValue({
        showSuccess,
        showError,
        showInfo: vi.fn(),
        showWarning: vi.fn(),
    } as never);
    return { showSuccess, showError };
}

beforeEach(() => {
    navigateMock.mockReset();
    mockToast();
});

describe('CheckoutContent', () => {
    it('muestra el estado de preparación cuando el carrito carga o está vacío', () => {
        useCheckoutMock.mockReturnValue(makeCheckoutMock({ cartLoading: true }) as never);
        renderCheckout();

        expect(screen.getByText('Preparando checkout…')).toBeInTheDocument();
    });

    it('muestra la redirección a Webpay cuando hay redirectInfo', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                paymentMethod: PAYMENT_METHODS.WEBPAY,
                redirectInfo: { urlRedireccion: 'https://tbk.test', token: 'tok_1' },
            }) as never
        );
        renderCheckout();

        expect(screen.getByTestId('redirect-webpay')).toHaveTextContent(
            'https://tbk.test / tok_1'
        );
    });

    it('en el paso de pedido permite continuar al pago', async () => {
        const user = userEvent.setup();
        const goNext = vi.fn();
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ step: 0, currentStep: 'pedido', canContinueShipping: true, goNext }) as never
        );
        renderCheckout();

        const button = screen.getByRole('button', { name: 'Continuar al pago' });
        expect(button).toBeEnabled();
        await user.click(button);

        expect(goNext).toHaveBeenCalled();
    });

    it('deshabilita continuar si no se puede continuar el envío o hay procesamiento', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                step: 0,
                currentStep: 'pedido',
                canContinueShipping: false,
                processing: true,
            }) as never
        );
        renderCheckout();

        expect(screen.getByRole('button', { name: 'Continuar al pago' })).toBeDisabled();
    });

    it('muestra el error del checkout como alerta', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                step: 0,
                currentStep: 'pedido',
                error: 'Error de ejemplo',
            }) as never
        );
        renderCheckout();

        expect(screen.getByRole('alert')).toHaveTextContent('Error de ejemplo');
    });

    it('muestra el botón Atrás y navega hacia atrás', async () => {
        const user = userEvent.setup();
        const goBack = vi.fn();
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                step: 1,
                currentStep: 'pago',
                canContinuePayment: true,
                goBack,
            }) as never
        );
        renderCheckout();

        const back = screen.getByRole('button', { name: 'Atrás' });
        expect(back).toBeEnabled();
        await user.click(back);
        expect(goBack).toHaveBeenCalled();
    });

    it('deshabilita Atrás mientras procesa', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ step: 1, currentStep: 'pago', processing: true }) as never
        );
        renderCheckout();

        expect(screen.getByRole('button', { name: 'Atrás' })).toBeDisabled();
    });

    it('no muestra Atrás en el primer paso', () => {
        useCheckoutMock.mockReturnValue(makeCheckoutMock({ step: 0 }) as never);
        renderCheckout();

        expect(screen.queryByRole('button', { name: 'Atrás' })).not.toBeInTheDocument();
    });

    it('muestra el botón de pago por defecto para QPayPro', async () => {
        const user = userEvent.setup();
        const completeCheckout = vi.fn().mockResolvedValue(baseResult);
        const { showSuccess } = mockToast();
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                step: 1,
                currentStep: 'pago',
                paymentMethod: PAYMENT_METHODS.QPAYPRO,
                canContinuePayment: true,
                completeCheckout,
            }) as never
        );
        renderCheckout();

        const pay = screen.getByRole('button', { name: 'Ir a QPayPro' });
        await user.click(pay);

        await waitFor(() => expect(completeCheckout).toHaveBeenCalled());
        expect(showSuccess).toHaveBeenCalledWith('¡Pedido realizado con éxito!');
        expect(navigateMock).toHaveBeenCalledWith(
            '/checkout/success',
            expect.objectContaining({ state: expect.objectContaining({ orden: baseResult.orden }) })
        );
    });

    it('muestra el botón de Webpay y su texto de procesamiento', async () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                step: 1,
                currentStep: 'pago',
                paymentMethod: PAYMENT_METHODS.WEBPAY,
                canContinuePayment: true,
            }) as never
        );
        renderCheckout();

        expect(screen.getByRole('button', { name: 'Ir a Webpay Plus' })).toBeInTheDocument();

        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                step: 1,
                currentStep: 'pago',
                paymentMethod: PAYMENT_METHODS.WEBPAY,
                canContinuePayment: true,
                processing: true,
            }) as never
        );
        renderCheckout();
        expect(screen.getByRole('button', { name: 'Creando pedido…' })).toBeInTheDocument();
    });

    it('muestra el mensaje de transferencia bancaria al completar', async () => {
        const user = userEvent.setup();
        const { showSuccess } = mockToast();
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                step: 1,
                currentStep: 'pago',
                paymentMethod: PAYMENT_METHODS.BANK_TRANSFER,
                canContinuePayment: true,
                completeCheckout: vi.fn().mockResolvedValue({
                    ...baseResult,
                    isBankTransfer: true,
                }),
            }) as never
        );
        renderCheckout();

        await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

        await waitFor(() =>
            expect(showSuccess).toHaveBeenCalledWith(
                'Pedido registrado. Realiza la transferencia y sube el comprobante desde tu historial.'
            )
        );
    });

    it('muestra el mensaje de contra entrega al completar', async () => {
        const user = userEvent.setup();
        const { showSuccess } = mockToast();
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                step: 1,
                currentStep: 'pago',
                paymentMethod: PAYMENT_METHODS.CONTRA_ENTREGA,
                canContinuePayment: true,
                completeCheckout: vi.fn().mockResolvedValue(baseResult),
            }) as never
        );
        renderCheckout();

        await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

        await waitFor(() =>
            expect(showSuccess).toHaveBeenCalledWith(
                '¡Pedido realizado con éxito! Se pagará contraentrega al recibirlo.'
            )
        );
    });

    it('no navega ni notifica cuando necesita redirección', async () => {
        const user = userEvent.setup();
        const { showSuccess } = mockToast();
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                step: 1,
                currentStep: 'pago',
                paymentMethod: PAYMENT_METHODS.WEBPAY,
                canContinuePayment: true,
                completeCheckout: vi.fn().mockResolvedValue({
                    success: true,
                    needsRedirect: true,
                    orden: { id: 1 },
                    payment: null,
                }),
            }) as never
        );
        renderCheckout();

        await user.click(screen.getByRole('button', { name: 'Ir a Webpay Plus' }));

        await waitFor(() => expect(navigateMock).not.toHaveBeenCalled());
        expect(showSuccess).not.toHaveBeenCalled();
    });

    it('muestra el error al fallar el checkout', async () => {
        const user = userEvent.setup();
        const { showError } = mockToast();
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                step: 1,
                currentStep: 'pago',
                paymentMethod: PAYMENT_METHODS.QPAYPRO,
                canContinuePayment: true,
                completeCheckout: vi.fn().mockResolvedValue({
                    success: false,
                    error: 'No se pudo procesar',
                }),
            }) as never
        );
        renderCheckout();

        await user.click(screen.getByRole('button', { name: 'Ir a QPayPro' }));

        await waitFor(() => expect(showError).toHaveBeenCalledWith('No se pudo procesar'));
        expect(navigateMock).not.toHaveBeenCalled();
    });

    it('muestra "Registrando pedido…" al procesar una transferencia', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                step: 1,
                currentStep: 'pago',
                paymentMethod: PAYMENT_METHODS.BANK_TRANSFER,
                canContinuePayment: true,
                processing: true,
            }) as never
        );
        renderCheckout();

        expect(screen.getByRole('button', { name: 'Registrando pedido…' })).toBeInTheDocument();
    });

    it('no permite pagos concurrentes', async () => {
        const user = userEvent.setup();
        let resolvePayment: (value: unknown) => void = () => {};
        const completeCheckout = vi.fn().mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolvePayment = resolve;
                })
        );
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                step: 1,
                currentStep: 'pago',
                paymentMethod: PAYMENT_METHODS.QPAYPRO,
                canContinuePayment: true,
                completeCheckout,
            }) as never
        );
        renderCheckout();

        const pay = screen.getByRole('button', { name: 'Ir a QPayPro' });
        await user.click(pay);
        await user.click(pay);

        expect(completeCheckout).toHaveBeenCalledTimes(1);

        resolvePayment(baseResult);
        await waitFor(() => expect(navigateMock).toHaveBeenCalled());
    });
});
