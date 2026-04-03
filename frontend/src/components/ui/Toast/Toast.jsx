import { useState, useEffect } from 'react';
import './Toast.css';

export const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Esperar la animación de fade out
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

export const ToastContainer = ({ toasts, removeToast }) => {
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