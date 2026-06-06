import { createContext, useContext, type ReactNode } from 'react';
import { useAuthLogic } from '@/features/auth/model/useAuthLogic';

export type AuthContextValue = ReturnType<typeof useAuthLogic>;

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

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
