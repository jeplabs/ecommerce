import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressApi } from '@/entities/address';
import type { AddressApi } from '@/entities/address';
import { orderApi, FORMA_PAGO_ENVIO } from '@/entities/order';
import type { FormaPago, OrderApi } from '@/entities/order';
import { paymentApi, PAYMENT_METHODS } from '@/features/checkout/api';
import type { PaymentMethod, PaymentSuccessResult, StripeCardFormValues } from '@/features/checkout/model/schemas/payment';
import { redirectUnauthorized } from '@/shared/lib/http-session';
import { ApiError } from '@/shared';
import {
    isPickupService,
    resolveShippingCost,
    resolveShippingCostInTotal,
    getServicioCostos,
} from '@/entities/shipping';
import { useEnvioOpcionesContext } from '@/app/providers';
import type { CartItemUiView } from '@/entities/cart';

const STEPS = ['envio', 'pago', 'confirmar'] as const;

export type CheckoutStep = (typeof STEPS)[number];

export type CheckoutLogicParams = {
    cartItems: CartItemUiView[];
    cartTotal: number;
    isEmpty: boolean;
};

export type CheckoutCompleteResult =
    | { success: true; orden: OrderApi; payment: PaymentSuccessResult }
    | { success: false; error?: string };

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

function toErrorStatus(error: unknown): number | undefined {
    return error instanceof ApiError ? error.status : undefined;
}

export function useCheckoutLogic({ cartItems, cartTotal, isEmpty }: CheckoutLogicParams) {
    const navigate = useNavigate();
    const {
        opciones: envioOpciones,
        servicios,
        loading: loadingEnvioOpciones,
        error: envioOpcionesError,
        refetch: refetchEnvioOpciones,
        pickupServices,
        deliveryServices,
    } = useEnvioOpcionesContext();

    const [step, setStep] = useState(0);
    const [direcciones, setDirecciones] = useState<AddressApi[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedServicioEnvioId, setSelectedServicioEnvioId] = useState<number | null>(null);
    const [formaPagoEnvio, setFormaPagoEnvio] = useState<FormaPago>(FORMA_PAGO_ENVIO.EN_LINEA);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS.STRIPE);
    const [cardData, setCardData] = useState<StripeCardFormValues>({
        cardholder: '',
        cardNumber: '',
        expiry: '',
        cvc: '',
    });
    const [notas, setNotas] = useState('');

    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentResult, setPaymentResult] = useState<PaymentSuccessResult | null>(null);

    const currentStep = STEPS[step];

    const handleAuthError = useCallback(
        (status: number | undefined) =>
            redirectUnauthorized(status, navigate, {
                state: { from: '/checkout' },
            }),
        [navigate]
    );

    const fetchDirecciones = useCallback(async () => {
        setLoadingAddresses(true);
        setError(null);
        try {
            const data = await addressApi.listar();
            const activas = (Array.isArray(data) ? data : []).filter(
                (d) => d.activo !== false
            );
            setDirecciones(activas);

            const principal = activas.find((d) => d.principal);
            if (principal) {
                setSelectedAddressId(principal.id);
            } else if (activas.length > 0) {
                setSelectedAddressId(activas[0].id);
            }
        } catch (err) {
            if (handleAuthError(toErrorStatus(err))) return;
            setError(toErrorMessage(err));
        } finally {
            setLoadingAddresses(false);
        }
    }, [handleAuthError]);

    useEffect(() => {
        if (!isEmpty) {
            void fetchDirecciones();
        }
    }, [isEmpty, fetchDirecciones]);

    useEffect(() => {
        if (processing) return;
        if (isEmpty) {
            navigate('/cart', { replace: true });
        }
    }, [isEmpty, navigate, processing]);

    useEffect(() => {
        if (loadingEnvioOpciones || servicios.length === 0) return;

        const stillValid = servicios.some((s) => s.id === selectedServicioEnvioId);
        if (stillValid) return;

        const preferPickup = pickupServices[0];
        const preferDelivery = deliveryServices[0];
        const defaultId =
            preferPickup?.id ?? preferDelivery?.id ?? servicios[0]?.id ?? null;
        setSelectedServicioEnvioId(defaultId);
    }, [
        loadingEnvioOpciones,
        servicios,
        pickupServices,
        deliveryServices,
        selectedServicioEnvioId,
    ]);

    const selectedAddress =
        direcciones.find((d) => d.id === selectedAddressId) ?? null;

    const selectedServicio = useMemo(
        () => servicios.find((s) => s.id === selectedServicioEnvioId) ?? null,
        [servicios, selectedServicioEnvioId]
    );

    const isPickupSelected = useMemo(
        () => isPickupService(selectedServicio),
        [selectedServicio]
    );

    const selectedServicioCostos = useMemo(
        () => getServicioCostos(selectedServicio),
        [selectedServicio]
    );

    const shippingCostDisplay = useMemo(
        () =>
            resolveShippingCost(
                envioOpciones ?? { envioGratis: false },
                selectedServicio,
                formaPagoEnvio
            ),
        [envioOpciones, selectedServicio, formaPagoEnvio]
    );

    const shippingCostInTotal = useMemo(
        () =>
            resolveShippingCostInTotal(
                envioOpciones ?? { envioGratis: false },
                selectedServicio,
                formaPagoEnvio
            ),
        [envioOpciones, selectedServicio, formaPagoEnvio]
    );

    const orderTotal = useMemo(
        () => cartTotal + shippingCostInTotal,
        [cartTotal, shippingCostInTotal]
    );

    const canContinueShipping =
        Boolean(selectedAddressId) &&
        Boolean(selectedServicioEnvioId) &&
        !loadingAddresses &&
        !loadingEnvioOpciones &&
        !envioOpcionesError &&
        servicios.length > 0;

    const canContinuePayment =
        paymentMethod === PAYMENT_METHODS.WEBPAY ||
        (paymentMethod === PAYMENT_METHODS.STRIPE &&
            Boolean(cardData.cardholder) &&
            Boolean(cardData.cardNumber) &&
            Boolean(cardData.expiry) &&
            Boolean(cardData.cvc));

    const goNext = useCallback(() => {
        setError(null);
        if (step < STEPS.length - 1) {
            setStep((s) => s + 1);
        }
    }, [step]);

    const goBack = useCallback(() => {
        setError(null);
        if (step > 0) {
            setStep((s) => s - 1);
        }
    }, [step]);

    const updateCardField = useCallback(
        (name: keyof StripeCardFormValues, value: string) => {
            setCardData((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const completeCheckout = useCallback(async (): Promise<CheckoutCompleteResult> => {
        if (!selectedAddressId || !selectedServicioEnvioId || isEmpty) {
            setError('Completa dirección y forma de entrega');
            return { success: false };
        }

        setProcessing(true);
        setError(null);

        const orderReference = `CHK-${Date.now()}`;

        try {
            const payment = await paymentApi.processPayment({
                method: paymentMethod,
                amount: orderTotal,
                orderReference,
                cardData:
                    paymentMethod === PAYMENT_METHODS.STRIPE ? cardData : undefined,
            });

            if (!payment.success) {
                setError(payment.error);
                return { success: false, error: payment.error };
            }

            setPaymentResult(payment);

            const orden = await orderApi.crearOrden({
                direccionId: selectedAddressId,
                servicioEnvioId: selectedServicioEnvioId,
                formaPago: formaPagoEnvio,
                notas: notas.trim() || null,
            });

            return {
                success: true,
                orden,
                payment,
            };
        } catch (err) {
            if (handleAuthError(toErrorStatus(err))) {
                return { success: false, error: 'Sesión expirada' };
            }
            const message = toErrorMessage(err) || 'Error al procesar el pedido';
            setError(message);
            return { success: false, error: message };
        } finally {
            setProcessing(false);
        }
    }, [
        selectedAddressId,
        selectedServicioEnvioId,
        isEmpty,
        paymentMethod,
        orderTotal,
        cardData,
        formaPagoEnvio,
        notas,
        handleAuthError,
    ]);

    return {
        steps: STEPS,
        step,
        currentStep,
        direcciones,
        selectedAddressId,
        setSelectedAddressId,
        selectedAddress,
        selectedServicioEnvioId,
        setSelectedServicioEnvioId,
        selectedServicio,
        selectedServicioCostos,
        isPickupSelected,
        envioOpciones,
        loadingEnvioOpciones,
        envioOpcionesError,
        refetchEnvioOpciones,
        pickupServices,
        deliveryServices,
        shippingCostDisplay,
        shippingCostInTotal,
        orderTotal,
        formaPagoEnvio,
        setFormaPagoEnvio,
        FORMA_PAGO_ENVIO,
        paymentMethod,
        setPaymentMethod,
        cardData,
        updateCardField,
        notas,
        setNotas,
        loadingAddresses,
        processing,
        error,
        setError,
        paymentResult,
        canContinueShipping,
        canContinuePayment,
        goNext,
        goBack,
        completeCheckout,
        fetchDirecciones,
        cartItems,
        cartTotal,
        PAYMENT_METHODS,
    };
}
