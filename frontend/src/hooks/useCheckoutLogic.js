import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { direccionService } from '../services/direccionService';
import { ordenService } from '../services/ordenService';
import { paymentService, PAYMENT_METHODS } from '../services/paymentService';
import { redirectUnauthorized } from '../utils/apiHelpers';
import { useEnvioOpcionesContext } from '../context/EnvioOpcionesContext';
import {
    isPickupService,
    paymentMethodToFormaPago,
    resolveShippingCost,
} from '../utils/envioHelpers';

const STEPS = ['envio', 'pago', 'confirmar'];

export const useCheckoutLogic = ({ cartItems, cartTotal, refreshCart, isEmpty }) => {
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
    const [direcciones, setDirecciones] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedServicioEnvioId, setSelectedServicioEnvioId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.STRIPE);
    const [cardData, setCardData] = useState({
        cardholder: '',
        cardNumber: '',
        expiry: '',
        cvc: '',
    });
    const [notas, setNotas] = useState('');

    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);

    const currentStep = STEPS[step];
    const formaPago = paymentMethodToFormaPago(paymentMethod);

    const handleAuthError = useCallback(
        (status) =>
            redirectUnauthorized(status, navigate, {
                state: { from: '/checkout' },
            }),
        [navigate]
    );

    const fetchDirecciones = useCallback(async () => {
        setLoadingAddresses(true);
        setError(null);
        try {
            const data = await direccionService.listar();
            const activas = (Array.isArray(data) ? data : []).filter((d) => d.activo !== false);
            setDirecciones(activas);

            const principal = activas.find((d) => d.principal);
            if (principal) {
                setSelectedAddressId(principal.id);
            } else if (activas.length > 0) {
                setSelectedAddressId(activas[0].id);
            }
        } catch (err) {
            if (handleAuthError(err.status)) return;
            setError(err.message);
        } finally {
            setLoadingAddresses(false);
        }
    }, [handleAuthError]);

    useEffect(() => {
        if (!isEmpty) {
            fetchDirecciones();
        }
    }, [isEmpty, fetchDirecciones]);

    useEffect(() => {
        if (isEmpty) {
            navigate('/cart', { replace: true });
        }
    }, [isEmpty, navigate]);

    useEffect(() => {
        if (loadingEnvioOpciones || servicios.length === 0) return;

        const stillValid = servicios.some((s) => s.id === selectedServicioEnvioId);
        if (stillValid) return;

        const preferPickup = pickupServices[0];
        const preferDelivery = deliveryServices[0];
        const defaultId = preferPickup?.id ?? preferDelivery?.id ?? servicios[0]?.id ?? null;
        setSelectedServicioEnvioId(defaultId);
    }, [
        loadingEnvioOpciones,
        servicios,
        pickupServices,
        deliveryServices,
        selectedServicioEnvioId,
    ]);

    const selectedAddress = direcciones.find((d) => d.id === selectedAddressId) || null;

    const selectedServicio = useMemo(
        () => servicios.find((s) => s.id === selectedServicioEnvioId) || null,
        [servicios, selectedServicioEnvioId]
    );

    const isPickupSelected = useMemo(
        () => isPickupService(selectedServicio),
        [selectedServicio]
    );

    const shippingCost = useMemo(
        () =>
            resolveShippingCost({
                opciones: envioOpciones,
                servicio: selectedServicio,
                formaPago,
            }),
        [envioOpciones, selectedServicio, formaPago]
    );

    const orderTotal = useMemo(() => cartTotal + shippingCost, [cartTotal, shippingCost]);

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
            cardData.cardholder &&
            cardData.cardNumber &&
            cardData.expiry &&
            cardData.cvc);

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

    const updateCardField = useCallback((name, value) => {
        setCardData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const completeCheckout = useCallback(async () => {
        if (!selectedAddressId || !selectedServicioEnvioId || isEmpty) {
            setError('Completa dirección y forma de entrega');
            return { success: false };
        }

        setProcessing(true);
        setError(null);

        const orderReference = `CHK-${Date.now()}`;

        try {
            const payment = await paymentService.processPayment({
                method: paymentMethod,
                amount: orderTotal,
                orderReference,
                cardData: paymentMethod === PAYMENT_METHODS.STRIPE ? cardData : undefined,
            });

            if (!payment.success) {
                setError(payment.error);
                return { success: false, error: payment.error };
            }

            setPaymentResult(payment);

            const orden = await ordenService.crearOrden({
                direccionId: selectedAddressId,
                servicioEnvioId: selectedServicioEnvioId,
                formaPago,
                notas: notas.trim() || null,
            });

            await refreshCart();

            return {
                success: true,
                orden,
                payment,
            };
        } catch (err) {
            if (handleAuthError(err.status)) {
                return { success: false, error: 'Sesión expirada' };
            }
            const message = err.message || 'Error al procesar el pedido';
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
        formaPago,
        notas,
        refreshCart,
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
        isPickupSelected,
        envioOpciones,
        loadingEnvioOpciones,
        envioOpcionesError,
        refetchEnvioOpciones,
        pickupServices,
        deliveryServices,
        shippingCost,
        orderTotal,
        formaPago,
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
};
