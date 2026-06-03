import { AuthProvider } from '@/app/providers/AuthProvider';
import { ProductProvider } from '@/app/providers/ProductProvider';
import { CartProvider } from '@/app/providers/CartProvider';
import { CategoriasProvider } from '@/app/providers/CategoriasProvider';
import { ToastProvider } from '@/app/providers/ToastProvider';

/**
 * Providers globales de la app (árbol en App.jsx).
 * Checkout y Profile se montan a nivel de página.
 */
export function AppProviders({ children }) {
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
