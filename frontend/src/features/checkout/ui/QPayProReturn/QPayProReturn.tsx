import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { useCart } from '@/app/providers';
import { iniciarQPayPro } from '@/features/checkout/api';
import type { PaymentSuccessResult } from '@/features/checkout/model/schemas/payment';
import RedirectToQPayPro from '@/features/checkout/ui/RedirectToQPayPro/RedirectToQPayPro';
import {
    limpiarOrdenQPayProPendiente,
    obtenerOrdenQPayProPendiente,
} from '@/features/checkout/lib/qpaypro-pending-order';
import { orderApi } from '@/entities/order/api/orderApi';
import type { OrderApi } from '@/entities/order';
import { formatCurrency } from '@/shared/lib/format';
import { ApiError, redirectUnauthorized } from '@/shared';
import { Button } from '@/shared/ui/Button';
import styles from './QPayProReturn.module.css';

type ReturnState =
    | { status: 'loading' }
    | { status: 'rejected'; message?: string }
    | { status: 'error'; message: string }
    | { status: 'recovery'; orden: OrderApi; message?: string };

export default function QPayProReturn() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshCart } = useCart();
    const processedRef = useRef(false);
    const [state, setState] = useState<ReturnState>({ status: 'loading' });
    const [retrying, setRetrying] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

    const ordenIdParam = searchParams.get('ordenId');
    const statusParam = searchParams.get('status');
    const errorParam = searchParams.get('error');

    const ordenId =
        (ordenIdParam ? Number(ordenIdParam) : null) ?? obtenerOrdenQPayProPendiente();

    const cargarOrdenYProcesar = useCallback(async () => {
        if (!ordenId) {
            setState({ status: 'error', message: 'Falta la referencia de la orden.' });
            return;
        }

        try {
            const orden = await orderApi.obtenerOrden(ordenId);

            if (orden.estado === 'CONFIRMADA') {
                const payment: PaymentSuccessResult = {
                    success: true,
                    transactionId: `QPAYPRO-${orden.id}`,
                    provider: 'QPayPro (Guatemala)',
                    amount: orden.total,
                    orderReference: `ORD-${orden.id}`,
                };

                limpiarOrdenQPayProPendiente();
                await refreshCart();
                navigate('/checkout/success', {
                    replace: true,
                    state: { orden, payment, isBankTransfer: false },
                });
                return;
            }

            if (orden.estado === 'CANCELADA') {
                limpiarOrdenQPayProPendiente();
                setState({ status: 'rejected', message: errorParam || 'El pago no fue aprobado.' });
                return;
            }

            setState({
                status: 'recovery',
                orden,
                message: errorParam || (statusParam === 'failure' ? 'El pago con QPayPro fue rechazado o cancelado.' : undefined),
            });
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                redirectUnauthorized(401, navigate, { state: { from: '/checkout' } });
                return;
            }
            const message = err instanceof Error ? err.message : 'No pudimos verificar tu pago.';
            setState({ status: 'error', message });
        }
    }, [ordenId, statusParam, errorParam, navigate, refreshCart]);

    useEffect(() => {
        if (processedRef.current) return;
        processedRef.current = true;

        void cargarOrdenYProcesar();
    }, [cargarOrdenYProcesar]);

    const handleRetry = useCallback(async () => {
        if (state.status !== 'recovery') return;

        setRetrying(true);
        setActionError(null);

        try {
            const init = await iniciarQPayPro({ ordenId: state.orden.id });
            setRedirectUrl(init.redirectUrl);
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
            limpiarOrdenQPayProPendiente();
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

    if (redirectUrl) {
        return <RedirectToQPayPro redirectUrl={redirectUrl} />;
    }

    return (
        <div className={styles.root}>
            {state.status === 'loading' && (
                <>
                    <div className={styles.confirming}>
                        <h2 className={styles.confirmingTitle}>Verificando tu pago…</h2>
                    </div>
                    <p className={styles.confirmingMessage}>
                        Estamos validando la respuesta de la pasarela QPayPro.
                    </p>
                    <p className={styles.noticeWarning}>
                        No recargues la página ni vuelvas atrás mientras procesamos tu solicitud.
                    </p>
                </>
            )}

            {state.status === 'rejected' && (
                <>
                    <div className={styles.rejected}>
                        <h2 className={styles.rejectedTitle}>Pago no aprobado</h2>
                    </div>
                    <p className={styles.noticeError}>
                        {state.message || 'Tu pago no pudo ser procesado por QPayPro.'}
                    </p>
                </>
            )}

            {state.status === 'error' && (
                <>
                    <h2 className={styles.title}>Error al verificar el pago</h2>
                    <p className={styles.text}>{state.message}</p>
                </>
            )}

            {state.status === 'recovery' && (
                <div className={styles.recovery}>
                    <div className={clsx(styles.rejected, styles.recoveryBanner)}>
                        <h2 className={styles.recoveryTitle}>Pago no completado</h2>
                    </div>
                    <div className={styles.recoveryIntro}>
                        <p className={styles.text}>
                            {state.message || 'El pago con QPayPro no fue completado o fue rechazado.'}
                        </p>
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
                            {retrying ? 'Preparando el pago…' : 'Intentar pagar nuevamente con QPayPro'}
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

            {(state.status === 'rejected' || state.status === 'error') && (
                <Link className={styles.primaryBtn} to="/checkout">
                    Volver al checkout
                </Link>
            )}
        </div>
    );
}

