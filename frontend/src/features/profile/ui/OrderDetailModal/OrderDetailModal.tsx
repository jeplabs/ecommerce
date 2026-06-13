import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import OrderDetail from '../OrderDetail/OrderDetail';
import type { OrderApi } from '@/entities/order';
import detailStyles from '../OrderDetail/OrderDetail.module.css';
import styles from './OrderDetailModal.module.css';

const TITLE_ID = 'order-detail-modal-title';

type OrderDetailModalProps = {
    isOpen: boolean;
    loading: boolean;
    orden: OrderApi | null;
    onClose: () => void;
    onCancel?: (ordenId: number) => void;
    cancelling: boolean;
};

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
}: OrderDetailModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const lastActiveRef = useRef<Element | null>(null);

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
            if (lastActiveRef.current instanceof HTMLElement) {
                lastActiveRef.current.focus();
            }
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const onKeyDown = (e: KeyboardEvent) => {
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
        <div className={styles.root}>
            <button
                type="button"
                className={styles.backdrop}
                aria-label="Cerrar detalle del pedido"
                onClick={onClose}
            />

            <div
                ref={panelRef}
                className={styles.panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby={orden ? TITLE_ID : undefined}
                aria-label={orden ? undefined : 'Cargando detalle del pedido'}
                aria-busy={loading ? 'true' : 'false'}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                {orden ? (
                    <OrderDetail
                        orden={orden}
                        onClose={onClose}
                        onCancel={onCancel}
                        cancelling={cancelling}
                        titleId={TITLE_ID}
                        className={detailStyles.detailInModal}
                    />
                ) : (
                    <div className={styles.skeleton} aria-busy="true" aria-label="Cargando detalle del pedido">
                        <div className={styles.skeletonLine} />
                        <div className={styles.skeletonLineShort} />
                        <div className={styles.skeletonBlock} />
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
