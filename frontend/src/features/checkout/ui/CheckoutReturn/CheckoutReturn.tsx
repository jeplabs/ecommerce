import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { useCart } from '@/app/providers';
import { confirmarWebpay, iniciarWebpay, notificarAbortada } from '@/features/checkout/api';
import type { PaymentSuccessResult } from '@/features/checkout/model/schemas/payment';
import RedirectToWebpay from '@/features/checkout/ui/RedirectToWebpay/RedirectToWebpay';
import {
    limpiarOrdenWebpayPendiente,
    obtenerOrdenWebpayPendiente,
    parsearOrdenIdDesdeTbk,
} from '@/features/checkout/lib/webpay-pending-order';
import { orderApi } from '@/entities/order';
import type { OrderApi } from '@/entities/order';
import { formatCurrency } from '@/shared/lib/format';
import { ApiError, redirectUnauthorized } from '@/shared';
import { Button } from '@/shared/ui/Button';
import styles from './CheckoutReturn.module.css';

type MotivoRecuperacion = 'aborted' | 'timeout' | 'rejected';

type ReturnState =
    | { status: 'loading' }
    | { status: 'aborted' }
    | { status: 'timeout' }
    | { status: 'rejected' }
    | { status: 'error'; message: string }
    | { status: 'recovery'; orden: OrderApi; motivo: MotivoRecuperacion };

const RECOVERY_COPY: Record<
    MotivoRecuperacion,
    { title: string; message: string }
> = {
    aborted: {
        title: 'Pago no completado',
        message: 'No completaste el pago en Webpay Plus.',
    },
    timeout: {
        title: 'Se agotó el tiempo',
        message: 'Se excedió el tiempo disponible para pagar en Webpay Plus.',
    },
    rejected: {
        title: 'Pago rechazado',
        message: 'Tu tarjeta fue rechazada por el banco.',
    },
};

export default function CheckoutReturn() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshCart } = useCart();
    const confirmedRef = useRef(false);
    const [state, setState] = useState<ReturnState>({ status: 'loading' });
    const [retrying, setRetrying] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [redirectInfo, setRedirectInfo] = useState<{
        url: string;
        token: string;
    } | null>(null);

    const tokenWs = searchParams.get('token_ws');
    const tbkToken = searchParams.get('TBK_TOKEN');
    const tbkOrdenCompra = searchParams.get('TBK_ORDEN_COMPRA');
    const tbkIdSesion = searchParams.get('TBK_ID_SESION');

    const cargarRecuperacion = useCallback(
        async (motivo: MotivoRecuperacion) => {
            const ordenId =
                obtenerOrdenWebpayPendiente() ?? parsearOrdenIdDesdeTbk(tbkOrdenCompra);

            if (!ordenId) {
                setState({ status: motivo });
                return;
            }

            try {
                const orden = await orderApi.obtenerOrden(ordenId);

                if (orden.estado === 'CONFIRMADA') {
                    limpiarOrdenWebpayPendiente();
                    await refreshCart();
                    navigate('/checkout/success', {
                        replace: true,
                        state: { orden, payment: null, isBankTransfer: false },
                    });
                    return;
                }

                if (orden.estado === 'CANCELADA') {
                    limpiarOrdenWebpayPendiente();
                    setState({ status: motivo });
                    return;
                }

                setState({ status: 'recovery', orden, motivo });
            } catch (err) {
                if (err instanceof ApiError && err.status === 401) {
                    redirectUnauthorized(401, navigate, { state: { from: '/checkout' } });
                    return;
                }
                setState({ status: motivo });
            }
        },
        [navigate, refreshCart, tbkOrdenCompra]
    );

    useEffect(() => {
        if (confirmedRef.current) return;
        confirmedRef.current = true;

        if (!tokenWs) {
            if (tbkToken) {
                void notificarAbortada(tbkToken).catch(() => undefined);
                void cargarRecuperacion('aborted');
                return;
            }
            if (tbkOrdenCompra || tbkIdSesion) {
                void cargarRecuperacion('timeout');
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

                    limpiarOrdenWebpayPendiente();
                    await refreshCart();
                    navigate('/checkout/success', {
                        replace: true,
                        state: { orden: result.orden, payment, isBankTransfer: false },
                    });
                    return;
                }

                const motivo: MotivoRecuperacion =
                    result.motivo === 'ABORTED'
                        ? 'aborted'
                        : result.motivo === 'TIMEOUT'
                          ? 'timeout'
                          : 'rejected';

                await cargarRecuperacion(motivo);
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
    }, [
        tokenWs,
        tbkToken,
        tbkOrdenCompra,
        tbkIdSesion,
        navigate,
        refreshCart,
        cargarRecuperacion,
    ]);

    const handleRetry = useCallback(async () => {
        if (state.status !== 'recovery') return;

        setRetrying(true);
        setActionError(null);

        try {
            const returnUrl = `${window.location.origin}/checkout/webpay/retorno`;
            const init = await iniciarWebpay({ ordenId: state.orden.id, returnUrl });
            setRedirectInfo({ url: init.url, token: init.token });
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                redirectUnauthorized(401, navigate, { state: { from: '/checkout' } });
                return;
            }
            setActionError(err instanceof Error ? err.message : 'No pudimos iniciar el pago.');
            setRetrying(false);
        }
    }, [state, navigate]);

    const handleCancel = useCallback(async () => {
        if (state.status !== 'recovery') return;

        setCancelling(true);
        setActionError(null);

        try {
            await orderApi.cancelarOrden(state.orden.id);
            limpiarOrdenWebpayPendiente();
            await refreshCart();
            navigate('/profile/ordenes', { replace: true });
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                redirectUnauthorized(401, navigate, { state: { from: '/checkout' } });
                return;
            }
            setActionError(err instanceof Error ? err.message : 'No pudimos cancelar el pedido.');
            setCancelling(false);
        }
    }, [state, navigate, refreshCart]);

    if (redirectInfo) {
        return (
            <RedirectToWebpay urlRedireccion={redirectInfo.url} token={redirectInfo.token} />
        );
    }

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

            {state.status === 'recovery' && (
                <div className={styles.recovery}>
                    <div
                        className={clsx(
                            state.motivo === 'rejected' ? styles.rejected : styles.aborted,
                            styles.recoveryBanner
                        )}
                    >
                        <h2 className={styles.recoveryTitle}>
                            {RECOVERY_COPY[state.motivo].title}
                        </h2>
                    </div>
                    <div className={styles.recoveryIntro}>
                        <p className={styles.text}>{RECOVERY_COPY[state.motivo].message}</p>
                        <p className={styles.text}>
                            Tu pedido sigue reservado: puedes reintentar el pago o cancelarlo.
                        </p>
                    </div>

                    <div className={styles.summary}>
                        <h3 className={styles.summaryTitle}>Resumen del pedido #{state.orden.id}</h3>
                        <ul className={styles.itemList}>
                            {state.orden.items?.map((item) => (
                                <li key={item.id} className={styles.itemRow}>
                                    <span className={styles.itemName}>
                                        {item.nombreProducto}{' '}
                                        <span className={styles.itemQty}>×{item.cantidad}</span>
                                    </span>
                                    <span>{formatCurrency(item.subtotal)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span>{formatCurrency(state.orden.total)}</span>
                        </div>
                    </div>

                    {actionError && <p className={styles.noticeError}>{actionError}</p>}

                    <div className={styles.actions}>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleRetry}
                            disabled={retrying}
                        >
                            {retrying ? 'Preparando el pago…' : 'Intentar pagar nuevamente'}
                        </Button>
                        <Button
                            variant="outlinePrimary"
                            fullWidth
                            onClick={handleCancel}
                            disabled={cancelling}
                        >
                            {cancelling ? 'Cancelando…' : 'Cancelar pedido'}
                        </Button>
                        <Link className={styles.link} to="/profile/ordenes">
                            Ver mis pedidos
                        </Link>
                    </div>
                </div>
            )}

            {(state.status === 'aborted' ||
                state.status === 'timeout' ||
                state.status === 'rejected' ||
                state.status === 'error') && (
                <Link className={styles.primaryBtn} to="/checkout">
                    Volver al checkout
                </Link>
            )}
        </div>
    );
}
