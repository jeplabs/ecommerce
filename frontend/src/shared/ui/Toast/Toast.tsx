import { useState, useEffect } from 'react';
import type { ToastItem, ToastType } from '@/app/providers/ToastProvider';
import './Toast.css';

type ToastProps = {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
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

    const getToastClass = () => {
        switch (type) {
            case 'success':
                return 'toast-success';
            case 'error':
                return 'toast-error';
            case 'warning':
                return 'toast-warning';
            default:
                return 'toast-info';
        }
    };

    return (
        <div className={`toast ${getToastClass()} ${isVisible ? 'toast-visible' : 'toast-hidden'}`}>
            <span>{message}</span>
            <button className="toast-close" onClick={() => setIsVisible(false)}>
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
        <div className="toast-container">
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
