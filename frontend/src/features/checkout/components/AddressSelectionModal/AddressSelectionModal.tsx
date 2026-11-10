import { useEffect, type ReactNode } from 'react';
import sharedStyles from '../checkoutShared.module.css';
import styles from './AddressSelectionModal.module.css';

interface AddressSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export default function AddressSelectionModal({
    isOpen,
    onClose,
    title,
    children,
}: AddressSelectionModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        ✕
                    </button>
                </div>
                <div className={styles.body}>{children}</div>
                <div className={styles.footer}>
                    <button
                        type="button"
                        className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}
                        onClick={onClose}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
