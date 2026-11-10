import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import BankTransferAccounts from '../BankTransferAccounts/BankTransferAccounts';
import { formatCurrency } from '@/shared/lib/format';
import styles from './BankTransferModal.module.css';

type BankTransferModalProps = {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    total: number;
};

export default function BankTransferModal({
    isOpen,
    onClose,
    orderId,
    total,
}: BankTransferModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const lastActiveRef = useRef<Element | null>(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        lastActiveRef.current = document.activeElement;
        const frameId = window.requestAnimationFrame(() => {
            panelRef.current?.focus();
        });

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.cancelAnimationFrame(frameId);
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', handleKeyDown);
            if (lastActiveRef.current instanceof HTMLElement) {
                lastActiveRef.current.focus();
            }
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className={styles.overlay} onClick={onClose} role="presentation">
            <div
                ref={panelRef}
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="bank-transfer-modal-title"
                aria-describedby="bank-transfer-modal-desc"
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <div>
                        <h3 id="bank-transfer-modal-title" className={styles.title}>
                            Datos para transferir
                        </h3>
                        <p id="bank-transfer-modal-desc" className={styles.subtitle}>
                            Pedido #{orderId} · Total a pagar: <strong>{formatCurrency(total)}</strong>
                        </p>
                    </div>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.instructions}>
                        <p>
                            Transfiere el total exacto a cualquiera de las siguientes cuentas bancarias y
                            recuerda subir el comprobante de pago desde <strong>Mi perfil → Pedidos</strong>{' '}
                            para confirmar tu compra.
                        </p>
                    </div>

                    <BankTransferAccounts orderId={orderId} total={total} compact={false} />
                </div>

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.confirmBtn}
                        onClick={onClose}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

