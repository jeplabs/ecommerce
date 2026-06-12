import { useState, useEffect } from 'react';
import clsx from 'clsx';
import type { ToastItem, ToastType } from '@/app/providers';
import styles from './Toast.module.css';

type ToastProps = {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
};

const TYPE_CLASS: Record<ToastType, string> = {
    success: styles.success,
    error: styles.error,
    warning: styles.warning,
    info: styles.info,
};

export const Toast = ({ message, type = 'success', duration = 4000, onClose }: ToastProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className={clsx(
                styles.toast,
                TYPE_CLASS[type] ?? styles.info,
                isVisible ? styles.visible : styles.hidden
            )}
        >
            <span>{message}</span>
            <button
                type="button"
                className={styles.close}
                onClick={() => setIsVisible(false)}
                aria-label="Cerrar notificación"
            >
                ×
            </button>
        </div>
    );
};

type ToastContainerProps = {
    toasts: ToastItem[];
    removeToast: (id: number) => void;
};

export const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => {
    return (
        <div className={styles.container}>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};
