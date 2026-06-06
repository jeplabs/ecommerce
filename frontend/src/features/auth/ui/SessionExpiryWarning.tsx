import { useAuth } from '@/app/providers';
import { useEffect, useRef } from 'react';
import { getJwtExpiryMs } from '@/shared/lib/jwt-expiry';
import './SessionExpiryWarning.css';

/** Antelación máxima del aviso respecto a `exp` (JWT largos). */
const WARN_LEAD_MAX_MS = 300 * 1000;
/** Antelación mínima: nunca avisar pegados al login en sesiones muy cortas. */
const WARN_LEAD_MIN_MS = 5 * 1000;

/**
 * Cuántos ms antes de `exp` mostrar el modal: como mucho 90 s, como poco 5 s,
 * y si la sesión es corta ~la mitad del tiempo restante (para no abrir al iniciar sesión).
 */
function computeWarnLeadMs(remainingMs: number): number {
    if (remainingMs <= 0) return WARN_LEAD_MIN_MS;
    const half = remainingMs / 2;
    return Math.min(WARN_LEAD_MAX_MS, Math.max(WARN_LEAD_MIN_MS, half));
}

/**
 * Diálogo nativo accesible; sin renovación de sesión en servidor hasta tener endpoint refresh.
 */
export default function SessionExpiryWarning() {
    const { isAuthenticated, user } = useAuth();
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            dialogRef.current?.close?.();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || !user?.token) return undefined;

        const expMs = getJwtExpiryMs(user.token);
        if (expMs == null) return undefined;

        const now = Date.now();
        const remainingMs = expMs - now;
        const leadMs = computeWarnLeadMs(remainingMs);
        const msUntilWarn = remainingMs - leadMs;

        const openIfStillValid = () => {
            if (Date.now() >= expMs) return;
            dialogRef.current?.showModal?.();
        };

        let id: number | undefined;
        if (msUntilWarn <= 0) {
            openIfStillValid();
        } else {
            id = window.setTimeout(openIfStillValid, msUntilWarn);
        }

        return () => {
            if (id) window.clearTimeout(id);
        };
    }, [isAuthenticated, user?.token]);

    return (
        <dialog
            ref={dialogRef}
            className="session-expiry-warning"
            aria-labelledby="session-expiry-title"
            aria-describedby="session-expiry-desc"
        >
            <div className="session-expiry-warning__inner">
                <h2 id="session-expiry-title" className="session-expiry-warning__title">
                    Tu sesión está por caducar
                </h2>
                <div id="session-expiry-desc" className="session-expiry-warning__text">
                    <p>En <b>5 minutos</b> tendrás que iniciar sesión de nuevo para usar el carrito, el perfil o el checkout.
                    Si tenías cambios sin guardar, conviene hacerlo ahora. </p>
                    <br></br>
                    <p>De todas manera te garantizamos que tus datos y los cambios de tu carrito de compras no se pierden y quedan <b>guardados en tu cuenta</b>.</p>
                </div>
                <div className="session-expiry-warning__actions">
                    <button
                        type="button"
                        className="session-expiry-warning__btn session-expiry-warning__btn--primary"
                        onClick={() => dialogRef.current?.close()}
                    >
                        Continuar
                    </button>
                </div>
            </div>
        </dialog>
    );
}
