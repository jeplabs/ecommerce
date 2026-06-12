import { type ReactNode } from 'react';
import { useAuthLogic } from '@/features/auth/model/useAuthLogic';
import { AuthContext } from './auth-context';

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const auth = useAuthLogic();

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: auth.isAuthenticated,
                user: auth.user,
                userRol: auth.userRol,
                loading: auth.loading,
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
}
