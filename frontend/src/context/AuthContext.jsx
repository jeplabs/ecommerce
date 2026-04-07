import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/config';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext)
};

export const AuthProvider = ({ children }) => {
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

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en el login');
            }

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
    }

    const register = async (userData) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                console.log("🔴 Respuesta Backend:", data);

                const erroresPorCampo = {};
                
                // Lista de campos válidos tal cual los espera el frontend (con mayúsculas si es necesario)
                // Asegúrate de que 'confirmarPassword' tenga la P mayúscula aquí también.
                const camposValidos = [
                    'nombre', 
                    'apellido', 
                    'pais', 
                    'email', 
                    'password', 
                    'confirmarPassword' // <--- Clave: Coincidir exactamente con el backend y el input
                ];

                for (const clave of Object.keys(data)) {
                    // Verificamos si la clave que viene del backend está en nuestra lista
                    // No hacemos toLowerCase(), comparamos tal cual viene
                    if (camposValidos.includes(clave)) {
                        erroresPorCampo[clave] = data[clave];
                    }
                }

                // 2. NUEVO PARCHE: Si no hay campos directos, revisar si es un error general de "email"
                if (Object.keys(erroresPorCampo).length === 0) {
                    const mensaje = data.error || data.message || Object.values(data)[0];
                    const msgLower = mensaje ? mensaje.toLowerCase() : '';

                    // Si el mensaje menciona "email" o "correo", lo asignamos al campo email
                    if (msgLower.includes('email') || msgLower.includes('correo')) {
                        erroresPorCampo['email'] = mensaje;
                    } 
                    // Puedes agregar más reglas aquí si el backend devuelve otros errores genéricos
                    else if (msgLower.includes('nombre')) {
                        erroresPorCampo['nombre'] = mensaje;
                    }
                    else {
                        // Si no sabemos a qué campo va, lo dejamos como error general
                        return {
                            success: false,
                            error: mensaje,
                            fields: null
                        };
                    }
                }

                if (Object.keys(erroresPorCampo).length > 0) {
                    return {
                        success: false,
                        error: "Hay errores en el formulario",
                        fields: erroresPorCampo
                    };
                }

                return {
                    success: false,
                    error: Object.values(data)[0] || 'Error en el registro',
                    field: null
                };
            }

            return { success: true, message: 'Registro exitoso' };

        } catch (error) {
            return { success: false, error: error.message, fields: null };
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        setUserRol(null);
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
    }

    const desactivarUsuario = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/usuarios/${id}/estado`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({ "activo": false })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en el login');
            }

            return { success: true, message: 'Usuario desactivado exitosamente' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const activarUsuario = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/usuarios/${id}/estado`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({ "activo": true })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en el login');
            }

            return { success: true, message: 'Usuario activado exitosamente' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider 
            value={{ 
                isAuthenticated, 
                user, 
                userRol, 
                login, 
                register, 
                logout,
                desactivarUsuario,
                activarUsuario
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    )
};