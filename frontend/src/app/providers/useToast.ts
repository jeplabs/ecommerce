import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from './toast-context';

export type { ToastContextValue, ToastItem, ToastType } from './toast-context';

export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe ser usado dentro de un ToastProvider');
    }
    return context;
}
