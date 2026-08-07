import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/app/providers';
import { confirmarWebpay } from '@/features/checkout/api';
import type { PaymentSuccessResult } from '@/features/checkout/model/schemas/payment';
import { ApiError, redirectUnauthorized } from '@/shared';
import styles from './CheckoutReturn.module.css';

type ReturnState =
    | { status: 'loading' }
    | { status: 'aborted' }
    | { status: 'timeout' }
    | { status: 'rejected' }
    | { status: 'error'; message: string };

export default function CheckoutReturn() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshCart } = useCart();
    const confirmedRef = useRef(false);
    const [state, setState] = useState<ReturnState>({ status: 'loading' });

    const tokenWs = searchParams.get('token_ws');
    const tbkToken = searchParams.get('TBK_TOKEN');
    const tbkOrdenCompra = searchParams.get('TBK_ORDEN_COMPRA');
    const tbkIdSesion = searchParams.get('TBK_ID_SESION');

    useEffect(() => {
        if (confirmedRef.current) return;
        confirmedRef.current = true;

        if (!tokenWs) {
            if (tbkToken) {
                setState({ status: 'aborted' });
                return;
            }
            if (tbkOrdenCompra || tbkIdSesion) {
                setState({ status: 'timeout' });
                return;
            }
            setState({ status: 'error', message: 'Retorno de Webpay inválido: faltan datos.' });
            return;
        }

        void (async () => {
            try {
                const result = await confirmarWebpay(tokenWs);

                if (result.success) {
                    const payment: PaymentSuccessResult = {
                        success: true,
                        transactionId: result.payment.transactionId,
                        provider: 'Webpay Plus (Transbank)',
                        amount: result.payment.amount,
                        orderReference: `ORD-${result.orden.id}`,
                        authorizationCode: result.payment.authorizationCode,
                    };

                    await refreshCart();
                    navigate('/checkout/success', {
                        replace: true,
                        state: { orden: result.orden, payment, isBankTransfer: false },
                    });
                    return;
                }

                if (result.motivo === 'ABORTED') {
                    setState({ status: 'aborted' });
                } else if (result.motivo === 'TIMEOUT') {
                    setState({ status: 'timeout' });
                } else {
                    setState({ status: 'rejected' });
                }
            } catch (err) {
                if (err instanceof ApiError && err.status === 401) {
                    redirectUnauthorized(401, navigate, { state: { from: '/checkout' } });
                    return;
                }
                const message =
                    err instanceof Error ? err.message : 'No pudimos confirmar tu pago.';
                setState({ status: 'error', message });
            }
        })();
    }, [tokenWs, tbkToken, tbkOrdenCompra, tbkIdSesion, navigate, refreshCart]);

    return (
        <div className={styles.root}>
            {state.status === 'loading' && (
                <>
                    <div className={styles.confirming}>
                        <h2 className={styles.confirmingTitle}>Confirmando tu pago…</h2>
                    </div>
                    <p className={styles.confirmingMessage}>
                        Estamos verificando el resultado con Transbank.
                    </p>
                    <p className={styles.noticeWarning}>
                        No recargues la página ni vuelvas atrás mientras se confirma tu pago.
                    </p>
                </>
            )}

            {state.status === 'aborted' && (
                <>
                    <div className={styles.aborted}>
                        <h2 className={styles.abortedTitle}>Pago no completado</h2>
                    </div>
                    <div className={styles.noticeStack}>
                        <p>No completaste el pago en Webpay Plus.</p>
                        <p>Puedes intentarlo nuevamente desde el checkout.</p>
                    </div>
                </>
            )}

            {state.status === 'timeout' && (
                <>
                    <h2 className={styles.title}>Se agotó el tiempo</h2>
                    <p className={styles.text}>
                        Se excedió el tiempo disponible para pagar en Webpay Plus. Intenta
                        nuevamente.
                    </p>
                </>
            )}

            {state.status === 'rejected' && (
                <>
                    <div className={styles.rejected}>
                        <h2 className={styles.rejectedTitle}>Pago rechazado</h2>
                    </div>
                    <p className={styles.noticeError}>Tu tarjeta fue rechazada por el banco.</p>
                </>
            )}

            {state.status === 'error' && (
                <>
                    <h2 className={styles.title}>Error al confirmar el pago</h2>
                    <p className={styles.text}>{state.message}</p>
                </>
            )}

            {state.status !== 'loading' && (
                <Link className={styles.primaryBtn} to="/checkout">
                    Volver al checkout
                </Link>
            )}
        </div>
    );
}