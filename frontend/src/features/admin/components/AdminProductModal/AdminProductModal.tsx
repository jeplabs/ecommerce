import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import styles from './AdminProductModal.module.css';

const DEFAULT_TITLE_ID = 'admin-product-modal-title';

export type AdminProductModalProps = {
    isOpen?: boolean;
    title: string;
    titleId?: string;
    onClose: () => void;
    children?: ReactNode;
    loading?: boolean;
    panelClassName?: string;
};

/**
 * Modal accesible para creación y edición de productos:
 * - Renderizado en Portal (document.body).
 * - Overlay con backdrop borroso y clic para cerrar.
 * - Cierre accesible con tecla Escape.
 * - Bloqueo de scroll del body (`overflow: hidden`) y restauración al desmontar.
 * - Foco retenido y retornado al elemento previo (`lastActiveRef`).
 * - Header sticky con título accesible (h1), botón Volver y botón cerrar (✕).
 * - Estado de carga con skeleton estilizado.
 */
export default function AdminProductModal({
    isOpen = true,
    title,
    titleId = DEFAULT_TITLE_ID,
    onClose,
    children,
    loading = false,
    panelClassName,
}: AdminProductModalProps) {
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
                aria-label={`Cerrar formulario de ${title.toLowerCase()}`}
                onClick={onClose}
            />

            <div
                ref={panelRef}
                className={clsx(styles.panel, panelClassName)}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-busy={loading ? 'true' : undefined}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <div className={styles.headerTitleGroup}>
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={onClose}
                        >
                            ← Volver a Productos
                        </button>
                        <h1 id={titleId} className={styles.title}>
                            {title}
                        </h1>
                    </div>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.body}>
                    {loading ? (
                        <div
                            className={styles.skeleton}
                            aria-busy="true"
                            aria-label={`Cargando ${title.toLowerCase()}`}
                        >
                            <div className={styles.skeletonLine} />
                            <div className={styles.skeletonLineShort} />
                            <div className={styles.skeletonBlock} />
                            <div className={styles.loadingText}>Cargando producto...</div>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
