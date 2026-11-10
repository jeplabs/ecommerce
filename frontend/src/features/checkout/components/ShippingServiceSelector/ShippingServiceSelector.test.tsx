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
import ShippingServiceSelector from './ShippingServiceSelector';
import { makeCheckoutMock } from '@/test/checkoutMock';
import { mockShippingServices } from '@/test/msw/fixtures/shipping';
import { formatCurrency } from '@/shared/lib/format';

const useCheckoutMock = vi.mocked(useCheckout);

const envioOptions = {
    servicios: mockShippingServices,
};

describe('ShippingServiceSelector', () => {
    it('muestra el estado de carga', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ loadingEnvioOpciones: true }) as never
        );
        render(<ShippingServiceSelector />);

        expect(screen.getByText('Cargando opciones de envío…')).toBeInTheDocument();
    });

    it('muestra el error y permite reintentar', async () => {
        const user = userEvent.setup();
        const refetch = vi.fn();
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                envioOpcionesError: 'Error al cargar',
                refetchEnvioOpciones: refetch,
            }) as never
        );
        render(<ShippingServiceSelector />);

        expect(screen.getByRole('alert')).toHaveTextContent('Error al cargar');

        await user.click(screen.getByRole('button', { name: 'Reintentar' }));
        expect(refetch).toHaveBeenCalled();
    });

    it('muestra mensaje cuando no hay opciones', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ envioOpciones: { ...envioOptions, servicios: [] } }) as never
        );
        render(<ShippingServiceSelector />);

        expect(
            screen.getByText('No hay servicios de envío disponibles. Contacta a la tienda.')
        ).toBeInTheDocument();
    });

    it('muestra las opciones y selecciona el servicio', async () => {
        const user = userEvent.setup({ pointerEventsCheck: 0 });
        const setSelected = vi.fn();
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ setSelectedServicioEnvioId: setSelected }) as never
        );
        render(<ShippingServiceSelector />);

        expect(screen.getByText('Retiro en tienda')).toBeInTheDocument();
        expect(screen.getByText('Envío estándar')).toBeInTheDocument();
        expect(screen.getByText('Envío express')).toBeInTheDocument();

        await user.click(screen.getByRole('radio', { name: /Envío express/ }));
        expect(setSelected).toHaveBeenCalledWith(3);
    });

    it('muestra el banner de envío gratis y el precio tachado', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                envioOpciones: { ...envioOptions, envioGratis: true },
            }) as never
        );
        render(<ShippingServiceSelector />);

        expect(screen.getByText(/¡Felicidades! ¡Tu pedido tiene envío normal gratis!/)).toBeInTheDocument();
        expect(screen.getAllByText('Gratis').length).toBeGreaterThan(0);
        expect(screen.getByText(formatCurrency(5.99))).toBeInTheDocument();
        expect(screen.getByText('No incluido en envío gratis')).toBeInTheDocument();
    });

    it('muestra la pista de monto mínimo cuando no hay envío gratis', () => {
        useCheckoutMock.mockReturnValue(makeCheckoutMock({}) as never);
        render(<ShippingServiceSelector />);

        expect(screen.getByText(/Compra desde/)).toBeInTheDocument();
        expect(screen.getByText(formatCurrency(150))).toBeInTheDocument();
    });

    it('muestra el costo contra entrega cuando aplica', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                formaPagoEnvio: 'CONTRA_ENTREGA',
                envioOpciones: {
                    ...envioOptions,
                    servicios: [
                        {
                            ...mockShippingServices[1]!,
                            costoEnLinea: 5.99,
                            costoContraEntrega: 8.5,
                        },
                    ],
                },
            }) as never
        );
        render(<ShippingServiceSelector />);

        expect(screen.getByText(formatCurrency(8.5))).toBeInTheDocument();
    });

    it('muestra el logo cuando existe y el placeholder cuando no', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({
                envioOpciones: {
                    ...envioOptions,
                    servicios: [
                        { ...mockShippingServices[0]!, logoUrl: 'https://logo.example/x.png' },
                        { ...mockShippingServices[1]!, logoUrl: null },
                    ],
                },
            }) as never
        );
        const { container } = render(<ShippingServiceSelector />);

        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            'https://logo.example/x.png'
        );
        expect(screen.getByText('📦')).toBeInTheDocument();
    });
});
