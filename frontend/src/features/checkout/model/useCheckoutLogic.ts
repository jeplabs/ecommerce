import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressApi } from '@/entities/address';
import type { AddressApi } from '@/entities/address';
import { orderApi, FORMA_PAGO_ENVIO } from '@/entities/order';
import type { OrderApi } from '@/entities/order';
import { paymentApi, PAYMENT_METHODS, iniciarWebpay, consultarEstadoWebpay } from '@/features/checkout/api';
import type { PaymentMethod, PaymentSuccessResult, StripeCardFormValues } from '@/features/checkout/model/schemas/payment';
import { isBankTransferPaymentMethod } from '@/features/checkout/model/schemas/payment';
import { markOrderAsBankTransfer } from '@/features/checkout/lib/transfer-order-storage';
import {
    guardarOrdenWebpayPendiente,
    limpiarOrdenWebpayPendiente,
    obtenerOrdenWebpayPendiente,
} from '@/features/checkout/lib/webpay-pending-order';
import { redirectUnauthorized } from '@/shared/lib/http-session';
import { ApiError } from '@/shared';
import {
    isPickupService,
    isExpressService,
    getCheckoutShippingOptions,
    resolveShippingCost,
    resolveShippingCostInTotal,
    getServicioCostos,
} from '@/entities/shipping';
import { useEnvioOpcionesContext } from '@/app/providers';
import type { CartItemUiView } from '@/entities/cart';
import {
    CHECKOUT_STEPS,
    CHECKOUT_FLOW_LAST_INDEX,
} from './checkoutSteps';

export const WEBPAY_POLL_BACKOFF_MS = [2000, 5000, 15000, 30000];
export const WEBPAY_POLL_TIMEOUT_MS = 5 * 60 * 1000;

export type { CheckoutStep } from './checkoutSteps';

export type CheckoutLogicParams = {
    cartItems: CartItemUiView[];
    cartTotal: number;
    isEmpty: boolean;
    refreshCart: () => Promise<void>;
};

export type CheckoutCompleteResult =
     | {
          success: true;
          needsRedirect: true;
          urlRedireccion: string;
          token: string;
          orden: OrderApi;
      }
    | {
          success: true;
          needsRedirect: false;
          orden: OrderApi;
          payment: PaymentSuccessResult | null;
          isBankTransfer: boolean;
      }
    | { success: false; error?: string };

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

function toErrorStatus(error: unknown): number | undefined {
    return error instanceof ApiError ? error.status : undefined;
}

export function useCheckoutLogic({
    cartItems,
    cartTotal,
    isEmpty,
    refreshCart,
}: CheckoutLogicParams) {
    const navigate = useNavigate();
    const checkoutCompletedRef = useRef(false);
    const {
        opciones: envioOpciones,
        servicios,
        loading: loadingEnvioOpciones,
        error: envioOpcionesError,
        refetch: refetchEnvioOpciones,
        pickupServices,
        deliveryServices,
        setFormaPagoEnvio: setContextFormaPagoEnvio,
    } = useEnvioOpcionesContext();

    const [step, setStep] = useState(0);
    const [direcciones, setDirecciones] = useState<AddressApi[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedServicioEnvioId, setSelectedServicioEnvioId] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS.STRIPE);
    const currentStep = CHECKOUT_STEPS[step];
    const isPaymentStep = currentStep === 'pago';
    const formaPagoEnvio = useMemo(
        () =>
            isPaymentStep && paymentMethod === PAYMENT_METHODS.CONTRA_ENTREGA
                ? FORMA_PAGO_ENVIO.CONTRA_ENTREGA
                : FORMA_PAGO_ENVIO.EN_LINEA,
        [isPaymentStep, paymentMethod]
    );

    useEffect(() => {
        setContextFormaPagoEnvio(formaPagoEnvio);
    }, [formaPagoEnvio, setContextFormaPagoEnvio]);
    const [cardData, setCardData] = useState<StripeCardFormValues>({
        cardholder: '',
        cardNumber: '',
        expiry: '',
        cvc: '',
    });
    const [notas, setNotas] = useState('');

    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [checkoutCompleted, setCheckoutCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentResult, setPaymentResult] = useState<PaymentSuccessResult | null>(null);
    const [redirectInfo, setRedirectInfo] = useState<{ urlRedireccion: string; token: string } | null>(null);
    const webpayOrdenIdRef = useRef<number | null>(null);
    const webpayPollEpochRef = useRef(0);
    const refreshCartRef = useRef(refreshCart);
    useEffect(() => {
        refreshCartRef.current = refreshCart;
    });
    const navigateRef = useRef(navigate);
    useEffect(() => {
        navigateRef.current = navigate;
    });

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
        if (processing || checkoutCompletedRef.current) return;
        if (isEmpty) {
            navigate('/cart', { replace: true });
        }
    }, [isEmpty, navigate, processing]);

    // useEffect(() => {
    //     if (loadingEnvioOpciones || servicios.length === 0) return;

    //     const stillValid = servicios.some((s) => s.id === selectedServicioEnvioId);
    //     if (stillValid) return;

    //     const checkoutOptions = getCheckoutShippingOptions(servicios);
    //     const preferNormal = checkoutOptions.find(
    //         (s) => !isPickupService(s) && !isExpressService(s)
    //     );
    //     const defaultId =
    //         preferNormal?.id ??
    //         checkoutOptions[0]?.id ??
    //         servicios[0]?.id ??
    //         null;
    //     setSelectedServicioEnvioId(defaultId);
    // }, [
    //     loadingEnvioOpciones,
    //     servicios,
    //     pickupServices,
    //     deliveryServices,
    //     selectedServicioEnvioId,
    // ]);

    const selectedAddress =
        direcciones.find((d) => d.id === selectedAddressId) ?? null;

    const selectedServicio = useMemo(
        () => servicios.find((s) => s.id === selectedServicioEnvioId) ?? null,
        [servicios, selectedServicioEnvioId]
    );

    useEffect(() => {
        if (selectedServicio && isExpressService(selectedServicio)) {
            setPaymentMethod((prev) => {
                if (prev === PAYMENT_METHODS.CONTRA_ENTREGA) {
                    return PAYMENT_METHODS.STRIPE;
                }
                return prev;
            });
        }
    }, [selectedServicio]);

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
        isBankTransferPaymentMethod(paymentMethod) ||
        paymentMethod === PAYMENT_METHODS.CONTRA_ENTREGA ||
        paymentMethod === PAYMENT_METHODS.WEBPAY ||
        paymentMethod === PAYMENT_METHODS.MERCADOPAGO ||
        (paymentMethod === PAYMENT_METHODS.STRIPE &&
            Boolean(cardData.cardholder) &&
            Boolean(cardData.cardNumber) &&
            Boolean(cardData.expiry) &&
            Boolean(cardData.cvc));

    const goNext = useCallback(() => {
        setError(null);
        if (step < CHECKOUT_FLOW_LAST_INDEX) {
            setStep((s) => s + 1);
        }
    }, [step]);

    const goBack = useCallback(() => {
        setError(null);
        if (step > 0) {
            setRedirectInfo(null);
            setStep((s) => s - 1);
        }
    }, [step]);

    const updateCardField = useCallback(
        (name: keyof StripeCardFormValues, value: string) => {
            setCardData((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const changePaymentMethod = useCallback((method: PaymentMethod) => {
        setRedirectInfo(null);
        setPaymentMethod(method);
    }, []);

    const completeCheckout = useCallback(async (): Promise<CheckoutCompleteResult> => {
        if (!selectedAddressId || !selectedServicioEnvioId || isEmpty) {
            setError('Completa dirección y forma de entrega');
            return { success: false };
        }

        setProcessing(true);
        setError(null);

        const orderReference = `CHK-${Date.now()}`;
        const isBankTransfer = isBankTransferPaymentMethod(paymentMethod);
        const isContraEntrega = paymentMethod === PAYMENT_METHODS.CONTRA_ENTREGA;
        const isWebpay = paymentMethod === PAYMENT_METHODS.WEBPAY;
        const needsGatewaySimulation = !isBankTransfer && !isContraEntrega && !isWebpay;

        try {
            let payment: PaymentSuccessResult | null = null;

            if (needsGatewaySimulation) {
                const paymentResult = await paymentApi.processPayment({
                    method: paymentMethod,
                    amount: orderTotal,
                    orderReference,
                    cardData:
                        paymentMethod === PAYMENT_METHODS.STRIPE ? cardData : undefined,
                });

                if (!paymentResult.success) {
                    setError(paymentResult.error);
                    return { success: false, error: paymentResult.error };
                }

                payment = paymentResult;
                setPaymentResult(paymentResult);
            } else {
                setPaymentResult(null);
            }

            const metodoPagoCodigo =
                paymentMethod === PAYMENT_METHODS.BANK_TRANSFER
                    ? 'TRANSFERENCIA'
                    : paymentMethod === PAYMENT_METHODS.CONTRA_ENTREGA
                    ? 'CONTRA_ENTREGA'
                    : paymentMethod === PAYMENT_METHODS.WEBPAY
                    ? 'WEBPAY'
                    : paymentMethod === PAYMENT_METHODS.MERCADOPAGO
                    ? 'MERCADO_PAGO'
                    : 'STRIPE';

            const orden = await orderApi.crearOrden({
                direccionId: selectedAddressId,
                servicioEnvioId: selectedServicioEnvioId,
                formaPagoEnvio: formaPagoEnvio,
                metodoPagoCodigo,
                notas: notas.trim() || null,
            });

            // Invalida cualquier polling reanudado de una orden previa
            // (p.ej. la recuperación del Caso 5 al volver a /checkout).
            webpayPollEpochRef.current += 1;

            if (isWebpay) {
                const init = await iniciarWebpay({ ordenId: orden.id });
                guardarOrdenWebpayPendiente(orden.id);
                webpayOrdenIdRef.current = orden.id;

                checkoutCompletedRef.current = true;
                setCheckoutCompleted(true);
                await refreshCart();

                const redirect = { urlRedireccion: init.url, token: init.token };
                setRedirectInfo(redirect);

                return { success: true, needsRedirect: true, ...redirect, orden };
            }

            if (isBankTransfer) {
                markOrderAsBankTransfer(orden.id);
            }

            checkoutCompletedRef.current = true;
            setCheckoutCompleted(true);
            await refreshCart();

            return {
                success: true,
                needsRedirect: false,
                orden,
                payment,
                isBankTransfer,
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
        refreshCart,
    ]);

    useEffect(() => {
        const ordenId = webpayOrdenIdRef.current ?? obtenerOrdenWebpayPendiente();
        if (!ordenId) return;

        let activo = true;
        let detenido = false;
        let paso = 0;
        let timerBackoff: ReturnType<typeof setTimeout> | undefined;
        const epoch = webpayPollEpochRef.current;

        const detener = () => {
            detenido = true;
        };

        const esVigente = () =>
            activo && !detenido && webpayPollEpochRef.current === epoch;

        const tick = async () => {
            if (!esVigente() || document.hidden) return;

            try {
                const estado = await consultarEstadoWebpay(ordenId);
                if (!esVigente() || document.hidden) return;

                if (estado.estado === 'APROBADA') {
                    detener();
                    webpayOrdenIdRef.current = null;
                    limpiarOrdenWebpayPendiente();
                    setRedirectInfo(null);

                    const orden = await orderApi.obtenerOrden(ordenId);
                    await refreshCartRef.current();
                    navigateRef.current('/checkout/success', {
                        replace: true,
                        state: { orden, payment: null, isBankTransfer: false },
                    });
                    return;
                }

                if (
                    estado.estado === 'RECHAZADA' ||
                    estado.estado === 'ABORTADA' ||
                    estado.estado === 'TIMEOUT'
                ) {
                    detener();
                    webpayOrdenIdRef.current = null;
                }
            } catch {
                // Error de red: el polling continúa (best-effort) hasta el deadline.
            }
        };

        const programar = () => {
            if (!esVigente() || document.hidden) return;
            timerBackoff = setTimeout(async () => {
                paso = Math.min(paso + 1, WEBPAY_POLL_BACKOFF_MS.length - 1);
                await tick();
                if (esVigente()) programar();
            }, WEBPAY_POLL_BACKOFF_MS[paso]);
        };

        const alCambiarVisibilidad = () => {
            if (document.hidden) return;
            paso = 0;
            void tick();
            programar();
        };

        document.addEventListener('visibilitychange', alCambiarVisibilidad);
        void tick();
        programar();
        const timerDeadline = setTimeout(detener, WEBPAY_POLL_TIMEOUT_MS);

        return () => {
            activo = false;
            document.removeEventListener('visibilitychange', alCambiarVisibilidad);
            if (timerBackoff) clearTimeout(timerBackoff);
            clearTimeout(timerDeadline);
        };
    }, [redirectInfo]);

    return {
        steps: CHECKOUT_STEPS,
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
        FORMA_PAGO_ENVIO,
        paymentMethod,
        setPaymentMethod: changePaymentMethod,
        cardData,
        updateCardField,
        notas,
        setNotas,
        loadingAddresses,
        processing,
        checkoutCompleted,
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
        redirectInfo,
    };
}
