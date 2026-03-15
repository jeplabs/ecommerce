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

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await response.json();
            setIsAuthenticated(true);
            setUser({ token: data.token, rol: data.rol });
            setUserRol(data.rol);
            localStorage.setItem('token', data.token);
            localStorage.setItem('rol', data.rol);
            return { success: true, rol: data.rol };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        setUserRol(null);
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, userRol, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    )
};