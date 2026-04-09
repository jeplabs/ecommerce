import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

/**
 * Estado y acciones de autenticación (login, registro, logout, activar/desactivar usuario).
 * El AuthProvider solo inyecta este valor en el contexto.
 */
export const useAuthLogic = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [userRol, setUserRol] = useState(null);
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

    const login = useCallback(async (email, password) => {
        try {
            const data = await authService.login(email, password);

            setIsAuthenticated(true);
            setUser({ token: data.token, rol: data.rol });
            setUserRol(data.rol);
            localStorage.setItem('token', data.token);
            localStorage.setItem('rol', data.rol);

            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                localStorage.setItem('user', JSON.stringify({ rol: data.rol, email: data.email }));
            }

            return { success: true, rol: data.rol };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }, []);

    const register = useCallback(async (userData) => {
        try {
            const { ok, data } = await authService.register(userData);

            if (!ok) {
                const erroresPorCampo = {};

                const camposValidos = [
                    'nombre',
                    'apellido',
                    'pais',
                    'email',
                    'password',
                    'confirmarPassword',
                ];

                for (const clave of Object.keys(data)) {
                    if (camposValidos.includes(clave)) {
                        erroresPorCampo[clave] = data[clave];
                    }
                }

                if (Object.keys(erroresPorCampo).length === 0) {
                    const mensaje = data.error || data.message || Object.values(data)[0];
                    const msgLower = mensaje ? mensaje.toLowerCase() : '';

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
                    error: Object.values(data)[0] || 'Error en el registro',
                    field: null,
                };
            }

            return { success: true, message: 'Registro exitoso' };
        } catch (error) {
            return { success: false, error: error.message, fields: null };
        }
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUser(null);
        setUserRol(null);
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
    }, []);

    const desactivarUsuario = useCallback(async (id) => {
        try {
            if (!user?.token) {
                return { success: false, error: 'No hay sesión' };
            }
            await authService.setUsuarioEstado(id, false, user.token);
            return { success: true, message: 'Usuario desactivado exitosamente' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }, [user?.token]);

    const activarUsuario = useCallback(async (id) => {
        try {
            if (!user?.token) {
                return { success: false, error: 'No hay sesión' };
            }
            await authService.setUsuarioEstado(id, true, user.token);
            return { success: true, message: 'Usuario activado exitosamente' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }, [user?.token]);

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
};
