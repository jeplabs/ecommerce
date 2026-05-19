import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import OrderDetail from '../OrderDetail/OrderDetail';
import './OrderDetailModal.css';

const TITLE_ID = 'order-detail-modal-title';

/**
 * Modal accesible: overlay, cierre con Escape y clic fuera, foco dentro del panel,
 * scroll del body bloqueado mientras está abierto.
 */
export default function OrderDetailModal({
    isOpen,
    loading,
    orden,
    onClose,
    onCancel,
    cancelling,
}) {
    const panelRef = useRef(null);
    const lastActiveRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        lastActiveRef.current = document.activeElement;
        const id = window.requestAnimationFrame(() => {
            panelRef.current?.focus();
        });

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.cancelAnimationFrame(id);
            document.body.style.overflow = prevOverflow;
            lastActiveRef.current?.focus?.();
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div className="order-detail-modal">
            <button
                type="button"
                className="order-detail-modal__backdrop"
                aria-label="Cerrar detalle del pedido"
                onClick={onClose}
            />

            <div
                ref={panelRef}
                className="order-detail-modal__panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby={orden ? TITLE_ID : undefined}
                aria-label={orden ? undefined : 'Cargando detalle del pedido'}
                aria-busy={loading ? 'true' : 'false'}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                {loading && !orden ? (
                    <p className="order-detail-modal__loading">Cargando pedido…</p>
                ) : orden ? (
                    <OrderDetail
                        orden={orden}
                        onClose={onClose}
                        onCancel={onCancel}
                        cancelling={cancelling}
                        titleId={TITLE_ID}
                    />
                ) : null}
            </div>
        </div>,
        document.body
    );
}
