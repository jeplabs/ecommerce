import { createContext, useContext } from 'react';
import { useAuthLogic } from '../hooks/useAuthLogic';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const auth = useAuthLogic();

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: auth.isAuthenticated,
                user: auth.user,
                userRol: auth.userRol,
                login: auth.login,
                register: auth.register,
                logout: auth.logout,
                desactivarUsuario: auth.desactivarUsuario,
                activarUsuario: auth.activarUsuario,
            }}
        >
            {!auth.loading && children}
        </AuthContext.Provider>
    );
};
