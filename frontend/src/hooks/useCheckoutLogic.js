import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { direccionService } from '../services/direccionService';
import { ordenService } from '../services/ordenService';
import { paymentService, PAYMENT_METHODS } from '../services/paymentService';
import { redirectUnauthorized } from '../utils/apiHelpers';

const STEPS = ['envio', 'pago', 'confirmar'];

export const useCheckoutLogic = ({ cartItems, cartTotal, refreshCart, isEmpty }) => {
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [direcciones, setDirecciones] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
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

    const selectedAddress = direcciones.find((d) => d.id === selectedAddressId) || null;

    const canContinueShipping = Boolean(selectedAddressId) && !loadingAddresses;
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
        if (!selectedAddressId || isEmpty) {
            setError('Selecciona una dirección de envío');
            return { success: false };
        }

        setProcessing(true);
        setError(null);

        const orderReference = `CHK-${Date.now()}`;

        try {
            const payment = await paymentService.processPayment({
                method: paymentMethod,
                amount: cartTotal,
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
        isEmpty,
        paymentMethod,
        cartTotal,
        cardData,
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
