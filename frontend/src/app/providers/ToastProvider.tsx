import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { ToastContainer } from '@/shared/ui/Toast/Toast';
import { ToastContext, type ToastItem, type ToastType } from './toast-context';

type ToastProviderProps = {
    children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showSuccess = useCallback(
        (message: string) => addToast(message, 'success'),
        [addToast]
    );
    const showError = useCallback((message: string) => addToast(message, 'error'), [addToast]);
    const showWarning = useCallback(
        (message: string) => addToast(message, 'warning'),
        [addToast]
    );
    const showInfo = useCallback((message: string) => addToast(message, 'info'), [addToast]);

    const value = useMemo(
        () => ({ showSuccess, showError, showWarning, showInfo }),
        [showSuccess, showError, showWarning, showInfo]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}
