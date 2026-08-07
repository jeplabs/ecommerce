import { PAYMENT_METHODS } from '@/features/checkout';
import { mockAddresses } from './msw/fixtures/addresses';
import { mockShippingServices } from './msw/fixtures/shipping';
import { mockProduct } from './msw/fixtures/products';
import { CHECKOUT_STEPS } from '@/features/checkout/model/checkoutSteps';

export type CheckoutMockOverrides = Partial<Record<string, unknown>> & {
    [key: string]: unknown;
};

/** Construye un mock por defecto del valor de `useCheckout()`. */
export function makeCheckoutMock(overrides: CheckoutMockOverrides = {}) {
    const goNext = overrides.goNext ?? (() => {});
    const goBack = overrides.goBack ?? (() => {});
    const completeCheckout = overrides.completeCheckout ?? (() => ({}));

    return {
        steps: CHECKOUT_STEPS,
        step: 0,
        currentStep: 'pedido',
        cartItems: [],
        cartTotal: 0,
        shippingCostInTotal: 0,
        orderTotal: 0,
        selectedServicioCostos: null,
        cartLoading: false,
        isEmpty: false,
        checkoutCompleted: false,
        error: null,
        processing: false,
        canContinueShipping: false,
        canContinuePayment: false,
        goNext,
        goBack,
        completeCheckout,
        paymentMethod: PAYMENT_METHODS.QPAYPRO,
        redirectInfo: null,

        direcciones: mockAddresses,
        selectedAddressId: mockAddresses[0]?.id ?? null,
        setSelectedAddressId: () => {},
        loadingAddresses: false,
        notas: '',
        setNotas: () => {},

        envioOpciones: { envioGratis: false, montoMinimoGratis: 150, servicios: mockShippingServices },
        loadingEnvioOpciones: false,
        envioOpcionesError: null,
        refetchEnvioOpciones: () => {},
        formaPagoEnvio: 'EN_LINEA',
        selectedServicioEnvioId: mockShippingServices[1]?.id ?? null,
        setSelectedServicioEnvioId: () => {},
        isPickupSelected: false,
        selectedServicio: mockShippingServices[1],
        setPaymentMethod: () => {},
        cardData: {
            cardholder: '',
            cardNumber: '',
            expiry: '',
            cvc: '',
        },
        updateCardField: () => {},

        ...overrides,
    };
}

export const mockCartItem = {
    id: 1,
    productoId: mockProduct.id,
    slug: mockProduct.slug,
    name: mockProduct.nombre,
    sku: mockProduct.sku,
    price: mockProduct.precioVenta,
    quantity: 2,
    qty: 2,
    subtotal: mockProduct.precioVenta * 2,
    imageUrl: mockProduct.imagenes?.[0]?.url ?? '',
    altText: mockProduct.nombre,
};
