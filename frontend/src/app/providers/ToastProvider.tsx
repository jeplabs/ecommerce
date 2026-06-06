import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    type ReactNode,
} from 'react';
import { ToastContainer } from '@/shared/ui/Toast/Toast';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastItem = {
    id: number;
    message: string;
    type: ToastType;
};

export type ToastContextValue = {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe ser usado dentro de un ToastProvider');
    }
    return context;
};

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
