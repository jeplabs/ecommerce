import { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '@/entities/user/api';
import type { RegisterFormValues, UserRole } from '@/entities/user';
import {
    clearAuthStorage,
    subscribeSessionInvalidated,
    subscribeSessionRefreshed,
    invalidateClientSession,
    broadcastAuthEvent,
    subscribeAuthBroadcast,
} from '@/shared/lib/auth-session-sync';
import {
    getAccessToken,
    setAccessToken,
    hasSessionFlag,
    clearAuthTokens,
} from '@/shared/lib/auth-token-store';
import { getJwtExpiryMs, getJwtRole } from '@/shared/lib/jwt-expiry';

type StoredAuthUser = {
    token: string;
    rol: UserRole | string | null;
};

export type LoginActionResult =
    | { success: true; rol: UserRole | string }
    | { success: false; error: string };

export type RegisterActionResult =
    | { success: true; message: string }
    | {
          success: false;
          error: string;
          fields?: Record<string, string> | null;
          field?: string | null;
      };

export type UserActionResult =
    | { success: true; message: string }
    | { success: false; error: string };

const REGISTER_FIELD_KEYS = [
    'nombre',
    'apellido',
    'pais',
    'email',
    'password',
    'confirmarPassword',
] as const;

/**
 * Estado y acciones de autenticación con arquitectura de Doble Token (Access en memoria/sessionStorage
 * y Refresh en Cookie HttpOnly con Silent Refresh y sincronización multi-pestaña).
 */
export function useAuthLogic() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<StoredAuthUser | null>(null);
    const [userRol, setUserRol] = useState<UserRole | string | null>(null);
    const [loading, setLoading] = useState(true);

    const lastActivityRef = useRef<number>(Date.now());

    // 1. Rehidratación de sesión al montar la app (soporta F5 instantáneo y apertura en frío)
    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            const token = getAccessToken();
            const expMs = token ? getJwtExpiryMs(token) : null;
            const isTokenValid = token != null && (expMs == null || expMs > Date.now() + 10_000);

            if (token && isTokenValid) {
                const rol = getJwtRole(token);
                setAccessToken(token);
                if (isMounted) {
                    setUser({ token, rol });
                    setIsAuthenticated(true);
                    setUserRol(rol);
                    setLoading(false);
                }
                return;
            }

            // Si el token en memoria no es válido pero hay sesión activa registrada, intentar Silent Refresh
            if (hasSessionFlag()) {
                const refreshed = await authApi.silentRefresh();
                if (refreshed && isMounted) {
                    setUser({ token: refreshed.token, rol: refreshed.rol });
                    setIsAuthenticated(true);
                    setUserRol(refreshed.rol);
                    setLoading(false);
                    return;
                }
            }

            if (isMounted) {
                setLoading(false);
            }
        };

        initAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    // 2. Suscripción a eventos de invalidación local
    useEffect(() => {
        return subscribeSessionInvalidated(() => {
            setIsAuthenticated(false);
            setUser(null);
            setUserRol(null);
            clearAuthTokens();
        });
    }, []);

    // 2.1. Suscripción a eventos de renovación exitosa fuera de React (ej. interceptor HTTP fetchWithAuth)
    useEffect(() => {
        return subscribeSessionRefreshed((detail) => {
            setUser({ token: detail.token, rol: detail.rol });
            setUserRol(detail.rol);
            setIsAuthenticated(true);
        });
    }, []);

    // 3. Sincronización multi-pestaña (BroadcastChannel)
    useEffect(() => {
        return subscribeAuthBroadcast(async (message) => {
            if (message.type === 'LOGOUT') {
                setIsAuthenticated(false);
                setUser(null);
                setUserRol(null);
                clearAuthTokens();
            } else if (message.type === 'LOGIN') {
                const refreshed = await authApi.silentRefresh();
                if (refreshed) {
                    setUser({ token: refreshed.token, rol: refreshed.rol });
                    setIsAuthenticated(true);
                    setUserRol(refreshed.rol);
                }
            }
        });
    }, []);

    // 4. Sincronización multi-pestaña ante cierre de sesión en otra pestaña
    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const onStorage = (e: StorageEvent) => {
            if (e.key === 'has_session' && !e.newValue) {
                setIsAuthenticated(false);
                setUser(null);
                setUserRol(null);
                clearAuthTokens();
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // 5. Detector ligero de actividad del usuario en el DOM (throttle de 30 segundos)
    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const onUserActivity = () => {
            const now = Date.now();
            if (now - lastActivityRef.current > 30_000) {
                lastActivityRef.current = now;
            }
        };

        window.addEventListener('pointerdown', onUserActivity, { passive: true });
        window.addEventListener('keydown', onUserActivity, { passive: true });
        window.addEventListener('scroll', onUserActivity, { passive: true });
        window.addEventListener('touchstart', onUserActivity, { passive: true });

        const onVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && hasSessionFlag()) {
                const currentToken = getAccessToken();
                const exp = currentToken ? getJwtExpiryMs(currentToken) : null;
                if (exp != null && exp <= Date.now() + 30_000) {
                    const refreshed = await authApi.silentRefresh();
                    if (refreshed) {
                        setUser({ token: refreshed.token, rol: refreshed.rol });
                        setUserRol(refreshed.rol);
                        setIsAuthenticated(true);
                    }
                }
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            window.removeEventListener('pointerdown', onUserActivity);
            window.removeEventListener('keydown', onUserActivity);
            window.removeEventListener('scroll', onUserActivity);
            window.removeEventListener('touchstart', onUserActivity);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, []);

    // 6. Temporizador de expiración y Renovación Silenciosa Proactiva (60 segundos antes)
    useEffect(() => {
        if (!isAuthenticated || !user?.token) return undefined;

        const expMs = getJwtExpiryMs(user.token);
        if (expMs == null) return undefined;

        const now = Date.now();
        const msUntilExp = expMs - now;
        const msUntilRenew = Math.max(0, msUntilExp - 60_000);

        // Si ya expiró
        if (msUntilExp <= 0) {
            authApi.silentRefresh().then((res) => {
                if (res) {
                    setUser({ token: res.token, rol: res.rol });
                    setUserRol(res.rol);
                    setIsAuthenticated(true);
                } else {
                    invalidateClientSession({ reason: 'jwt_expired' });
                }
            });
            return;
        }

        // Límite de 32 bits con signo para setTimeout (~24.8 días según HTML Living Standard).
        // Solo programamos temporizador si el tiempo está en rango positivo y seguro.
        const MAX_TIMEOUT_MS = 2_147_483_647;
        if (msUntilRenew > 0 && msUntilRenew <= MAX_TIMEOUT_MS) {
            const renewTimer = window.setTimeout(async () => {
                const hadRecentActivity = Date.now() - lastActivityRef.current < 15 * 60 * 1000;
                if (hadRecentActivity) {
                    const refreshed = await authApi.silentRefresh();
                    if (refreshed) {
                        setUser({ token: refreshed.token, rol: refreshed.rol });
                        setUserRol(refreshed.rol);
                        setIsAuthenticated(true);
                    }
                }
            }, msUntilRenew);

            return () => window.clearTimeout(renewTimer);
        }
    }, [isAuthenticated, user?.token]);

    const login = useCallback(
        async (email: string, password: string): Promise<LoginActionResult> => {
            try {
                const data = await authApi.login(email, password);

                setAccessToken(data.token);
                setIsAuthenticated(true);
                setUser({ token: data.token, rol: data.rol });
                setUserRol(data.rol);

                broadcastAuthEvent({ type: 'LOGIN' });

                return { success: true, rol: data.rol };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al iniciar sesión',
                };
            }
        },
        []
    );

    const register = useCallback(
        async (userData: RegisterFormValues): Promise<RegisterActionResult> => {
            try {
                const { ok, data } = await authApi.register(userData);

                if (!ok) {
                    const erroresPorCampo: Record<string, string> = {};

                    for (const clave of Object.keys(data)) {
                        if (
                            REGISTER_FIELD_KEYS.includes(
                                clave as (typeof REGISTER_FIELD_KEYS)[number]
                            ) &&
                            typeof data[clave] === 'string'
                        ) {
                            erroresPorCampo[clave] = data[clave] as string;
                        }
                    }

                    if (Object.keys(erroresPorCampo).length === 0) {
                        const mensaje =
                            (typeof data.error === 'string' && data.error) ||
                            (typeof data.message === 'string' && data.message) ||
                            '';
                        const msgLower = mensaje.toLowerCase();

                        if (msgLower.includes('email') || msgLower.includes('correo')) {
                            erroresPorCampo.email = mensaje;
                        } else if (msgLower.includes('nombre')) {
                            erroresPorCampo.nombre = mensaje;
                        } else {
                            return {
                                success: false,
                                error: mensaje,
                                fields: null,
                            };
                        }
                    }

                    if (Object.keys(erroresPorCampo).length > 0) {
                        return {
                            success: false,
                            error: 'Hay errores en el formulario',
                            fields: erroresPorCampo,
                        };
                    }

                    return {
                        success: false,
                        error: String(Object.values(data)[0] ?? 'Error en el registro'),
                        field: null,
                    };
                }

                return { success: true, message: 'Registro exitoso' };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error en el registro',
                    fields: null,
                };
            }
        },
        []
    );

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            // Ignorar
        } finally {
            clearAuthStorage();
            broadcastAuthEvent({ type: 'LOGOUT' });
            setIsAuthenticated(false);
            setUser(null);
            setUserRol(null);
        }
    }, []);

    const logoutAll = useCallback(async () => {
        try {
            await authApi.logoutAll();
        } catch {
            // Ignorar
        } finally {
            clearAuthStorage();
            broadcastAuthEvent({ type: 'LOGOUT' });
            setIsAuthenticated(false);
            setUser(null);
            setUserRol(null);
        }
    }, []);

    const desactivarUsuario = useCallback(
        async (id: number): Promise<UserActionResult> => {
            try {
                if (!user?.token) {
                    return { success: false, error: 'No hay sesión' };
                }
                await authApi.setUsuarioEstado(id, false);
                return { success: true, message: 'Usuario desactivado exitosamente' };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al desactivar',
                };
            }
        },
        [user]
    );

    const activarUsuario = useCallback(
        async (id: number): Promise<UserActionResult> => {
            try {
                if (!user?.token) {
                    return { success: false, error: 'No hay sesión' };
                }
                await authApi.setUsuarioEstado(id, true);
                return { success: true, message: 'Usuario activado exitosamente' };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al activar',
                };
            }
        },
        [user]
    );

    return {
        isAuthenticated,
        user,
        userRol,
        loading,
        login,
        register,
        logout,
        logoutAll,
        desactivarUsuario,
        activarUsuario,
    };
}
