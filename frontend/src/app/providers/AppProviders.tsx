import { useEffect, type ReactNode } from 'react';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ProductProvider } from '@/app/providers/ProductProvider';
import { CartProvider } from '@/app/providers/CartProvider';
import { CategoriasProvider } from '@/app/providers/CategoriasProvider';
import { FavoritesProvider } from '@/app/providers/FavoritesProvider';
import { ToastProvider } from '@/app/providers/ToastProvider';
import { setCurrencyConfig } from '@/shared/lib/format';

type AppProvidersProps = {
    children: ReactNode;
};



/**
 * Providers globales de la app (árbol en App.tsx).
 * Checkout y Profile se montan a nivel de página.
*/
export function AppProviders({ children }: AppProvidersProps) {
    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        fetch(`${API_URL}/api/config`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.moneda) {
                    setCurrencyConfig(data.moneda);
                }
            })
            .catch(() => {
                // Mantiene el fallback local si el servidor aún no responde
            });
    }, []);
    return (
        <ToastProvider>
            <AuthProvider>
                <ProductProvider>
                    <CartProvider>
                        <FavoritesProvider>
                            <CategoriasProvider>{children}</CategoriasProvider>
                        </FavoritesProvider>
                    </CartProvider>
                </ProductProvider>
            </AuthProvider>
        </ToastProvider>
    );
}
