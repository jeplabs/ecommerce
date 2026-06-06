import type { ReactNode } from 'react';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ProductProvider } from '@/app/providers/ProductProvider';
import { CartProvider } from '@/app/providers/CartProvider';
import { CategoriasProvider } from '@/app/providers/CategoriasProvider';
import { ToastProvider } from '@/app/providers/ToastProvider';

type AppProvidersProps = {
    children: ReactNode;
};

/**
 * Providers globales de la app (árbol en App.tsx).
 * Checkout y Profile se montan a nivel de página.
 */
export function AppProviders({ children }: AppProvidersProps) {
    return (
        <AuthProvider>
            <ProductProvider>
                <CartProvider>
                    <CategoriasProvider>
                        <ToastProvider>{children}</ToastProvider>
                    </CategoriasProvider>
                </CartProvider>
            </ProductProvider>
        </AuthProvider>
    );
}
