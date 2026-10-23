import { useToast } from '@/app/providers';
import { useEffect, useRef } from 'react';

import { subscribeSessionInvalidated } from '@/shared/lib/auth-session-sync';
import SessionExpiryWarning from './SessionExpiryWarning';

const TOAST_DEBOUNCE_MS = 4500;

/**
 * Efectos globales ligados a la sesión (toasts, aviso de caducidad JWT).
 * Debe montarse dentro de ToastProvider y AuthProvider.
 */
export default function AuthSessionListeners() {
    const { showWarning } = useToast();
    const lastToastAt = useRef(0);

    useEffect(() => {
        return subscribeSessionInvalidated((detail) => {
            const now = Date.now();
            if (now - lastToastAt.current < TOAST_DEBOUNCE_MS) return;
            lastToastAt.current = now;
            const message =
                detail?.reason === 'jwt_expired'
                    ? 'Tu sesión ha caducado. Inicia sesión de nuevo para continuar.'
                    : 'Tu sesión ha expirado o ya no es válida. Inicia sesión de nuevo para usar cuenta, carrito o checkout.';
            showWarning(message);
        });
    }, [showWarning]);

    // ARQUITECTURA DOBLE TOKEN:
    // La renovación del Access Token se realiza de forma silenciosa y transparente en segundo plano
    // (mediante Refresh Token en Cookie HttpOnly), por lo que ya no es necesario interrumpir al usuario
    // con un modal emergente que avise sobre la caducidad inminente del Access Token.
    // Se conserva la referencia al componente comentada por retrocompatibilidad y trazabilidad.
    //
    // return <SessionExpiryWarning />;
    return null;
}
