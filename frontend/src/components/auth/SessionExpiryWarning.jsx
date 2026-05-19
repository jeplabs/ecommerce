import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJwtExpiryMs } from '../../utils/jwtExpiry';
import './SessionExpiryWarning.css';

/** Antelación máxima del aviso respecto a `exp` (JWT largos). */
const WARN_LEAD_MAX_MS = 90 * 1000;
/** Antelación mínima: nunca avisar pegados al login en sesiones muy cortas. */
const WARN_LEAD_MIN_MS = 5 * 1000;

/**
 * Cuántos ms antes de `exp` mostrar el modal: como mucho 90 s, como poco 5 s,
 * y si la sesión es corta ~la mitad del tiempo restante (para no abrir al iniciar sesión).
 */
function computeWarnLeadMs(remainingMs) {
    if (remainingMs <= 0) return WARN_LEAD_MIN_MS;
    const half = remainingMs / 2;
    return Math.min(WARN_LEAD_MAX_MS, Math.max(WARN_LEAD_MIN_MS, half));
}

/**
 * Diálogo nativo accesible; sin renovación de sesión en servidor hasta tener endpoint refresh.
 */
export default function SessionExpiryWarning() {
    const { isAuthenticated, user } = useAuth();
    const dialogRef = useRef(null);

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

        let id;
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
                <p id="session-expiry-desc" className="session-expiry-warning__text">
                    En breve tendrás que iniciar sesión de nuevo para usar el carrito, el perfil o el checkout.
                    Si tenías cambios sin guardar, conviene hacerlo ahora. Para prolongar la sesión haría falta un
                    endpoint de renovación en el servidor; por ahora solo podemos avisarte con antelación.
                </p>
                <div className="session-expiry-warning__actions">
                    <button
                        type="button"
                        className="session-expiry-warning__btn session-expiry-warning__btn--primary"
                        onClick={() => dialogRef.current?.close()}
                    >
                        Continuar
                    </button>
                    <Link
                        to="/login"
                        className="session-expiry-warning__btn session-expiry-warning__btn--secondary"
                        onClick={() => dialogRef.current?.close()}
                    >
                        Iniciar sesión de nuevo
                    </Link>
                </div>
            </div>
        </dialog>
    );
}
