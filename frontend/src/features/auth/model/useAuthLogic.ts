import { useState, useEffect, useCallback } from 'react';
import { authApi } from '@/entities/user/api';
import type { RegisterFormValues, UserRole } from '@/entities/user';
import {
    clearAuthStorage,
    subscribeSessionInvalidated,
    invalidateClientSession,
} from '@/shared/lib/auth-session-sync';
import { getJwtExpiryMs } from '@/shared/lib/jwt-expiry';

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
 * Estado y acciones de autenticación (login, registro, logout, activar/desactivar usuario).
 */
export function useAuthLogic() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<StoredAuthUser | null>(null);
    const [userRol, setUserRol] = useState<UserRole | string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const rol = localStorage.getItem('rol');
        if (token) {
            setUser({ token, rol });
            setIsAuthenticated(true);
            setUserRol(rol);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        return subscribeSessionInvalidated(() => {
            setIsAuthenticated(false);
            setUser(null);
            setUserRol(null);
        });
    }, []);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key !== 'token') return;
            const token = localStorage.getItem('token');
            const rol = localStorage.getItem('rol');
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                setUserRol(null);
            } else {
                setUser({ token, rol });
                setIsAuthenticated(true);
                setUserRol(rol);
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !user?.token) return undefined;

        const expMs = getJwtExpiryMs(user.token);
        if (expMs == null) return undefined;

        const msUntilExp = expMs - Date.now();

        const onExpire = () => {
            invalidateClientSession({ reason: 'jwt_expired' });
        };

        if (msUntilExp <= 0) {
            onExpire();
            return undefined;
        }

        const id = window.setTimeout(onExpire, msUntilExp);
        return () => window.clearTimeout(id);
    }, [isAuthenticated, user?.token]);

    const login = useCallback(
        async (email: string, password: string): Promise<LoginActionResult> => {
            try {
                const data = await authApi.login(email, password);

                setIsAuthenticated(true);
                setUser({ token: data.token, rol: data.rol });
                setUserRol(data.rol);
                localStorage.setItem('token', data.token);
                localStorage.setItem('rol', data.rol);

                localStorage.setItem(
                    'user',
                    JSON.stringify({
                        id: data.id,
                        nombre: data.nombre,
                        apellido: data.apellido,
                        email: data.email,
                        rol: data.rol,
                    })
                );

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
                            String(Object.values(data)[0] ?? 'Error en el registro');
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

    const logout = useCallback(() => {
        clearAuthStorage();
        setIsAuthenticated(false);
        setUser(null);
        setUserRol(null);
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
        desactivarUsuario,
        activarUsuario,
    };
}
