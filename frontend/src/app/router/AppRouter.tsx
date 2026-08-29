import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthSessionListeners } from '@/features/auth';
import ShopLayout from '@/widgets/layout/ShopLayout/ShopLayout';
import AdminLayout from '@/widgets/layout/AdminLayout/AdminLayout';
import PrivateRoute from './PrivateRoute';
import GuestRoute from './GuestRoute';
import ScrollToTop from './ScrollToTop';
import { ProfileProvider } from '@/app/providers';
import { LazyRouteFallback } from './LazyRouteFallback';

const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
    import('@/pages/register').then((m) => ({ default: m.RegisterPage }))
);
const ResetPasswordPage = lazy(() =>
    import('@/pages/reset-password').then((m) => ({ default: m.ResetPasswordPage }))
);
const ProfilePage = lazy(() =>
    import('@/pages/profile').then((m) => ({ default: m.ProfilePage }))
);
const CartPage = lazy(() => import('@/pages/cart').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() =>
    import('@/pages/checkout').then((m) => ({ default: m.CheckoutPage }))
);
const CheckoutReturnPage = lazy(() =>
    import('@/pages/checkout').then((m) => ({ default: m.CheckoutReturnPage }))
);
const CheckoutSuccessPage = lazy(() =>
    import('@/pages/checkout-success').then((m) => ({ default: m.CheckoutSuccessPage }))
);
const ProductPage = lazy(() => import('@/pages/product').then((m) => ({ default: m.ProductPage })));
const CatalogPage = lazy(() => import('@/pages/catalog').then((m) => ({ default: m.CatalogPage })));
const CategoryPage = lazy(() =>
    import('@/pages/category').then((m) => ({ default: m.CategoryPage }))
);
const AdminDashboardPage = lazy(() =>
    import('@/pages/admin/dashboard').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminProductsPage = lazy(() =>
    import('@/pages/admin/products').then((m) => ({ default: m.AdminProductsPage }))
);
const AdminProductNewPage = lazy(() =>
    import('@/pages/admin/product-new').then((m) => ({ default: m.AdminProductNewPage }))
);
const AdminProductEditPage = lazy(() =>
    import('@/pages/admin/product-edit').then((m) => ({ default: m.AdminProductEditPage }))
);
const AdminUsersPage = lazy(() =>
    import('@/pages/admin/users').then((m) => ({ default: m.AdminUsersPage }))
);
const AdminUserEditPage = lazy(() =>
    import('@/pages/admin/user-edit').then((m) => ({ default: m.AdminUserEditPage }))
);
const AdminOrdersPage = lazy(() =>
    import('@/pages/admin/orders').then((m) => ({ default: m.AdminOrdersPage }))
);

export function AppRouter() {
    return (
        <Router>
            <ScrollToTop />
            <AuthSessionListeners />
            <Suspense fallback={<LazyRouteFallback />}>
            <Routes>
                {/* Tienda: nav + categorías + footer */}
                <Route element={<ShopLayout showCategoriasNav />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/producto/:slug" element={<ProductPage />} />
                    <Route path="/catalogo" element={<CatalogPage />} />
                    <Route path="/categoria/*" element={<CategoryPage />} />
                </Route>

                {/* Tienda: nav + footer (sin barra de categorías) */}
                <Route element={<ShopLayout showCategoriasNav={false} />}>
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <LoginPage />
                            </GuestRoute>
                        }
                    />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route
                        path="/profile/*"
                        element={
                            <PrivateRoute requiredRol="ROLE_CUSTOMER">
                                <ProfileProvider>
                                    <ProfilePage />
                                </ProfileProvider>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/cart"
                        element={
                            <PrivateRoute requiredRol="ROLE_CUSTOMER">
                                <CartPage />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/carrito" element={<Navigate to="/cart" replace />} />
                    <Route
                        path="/checkout"
                        element={
                            <PrivateRoute requiredRol="ROLE_CUSTOMER">
                                <CheckoutPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/checkout/success"
                        element={
                            <PrivateRoute requiredRol="ROLE_CUSTOMER">
                                <CheckoutSuccessPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/checkout/retorno"
                        element={
                            <PrivateRoute requiredRol="ROLE_CUSTOMER">
                                <CheckoutReturnPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/checkout/webpay/retorno"
                        element={
                            <PrivateRoute requiredRol="ROLE_CUSTOMER">
                                <CheckoutReturnPage />
                            </PrivateRoute>
                        }
                    />
                </Route>

                {/* Admin */}
                <Route element={<AdminLayout />}>
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute requiredRol="ROLE_ADMIN">
                                <AdminDashboardPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/products"
                        element={
                            <PrivateRoute requiredRol="ROLE_ADMIN">
                                <AdminProductsPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/products/new"
                        element={
                            <PrivateRoute requiredRol="ROLE_ADMIN">
                                <AdminProductNewPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/products/edit/:id"
                        element={
                            <PrivateRoute requiredRol="ROLE_ADMIN">
                                <AdminProductEditPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <PrivateRoute requiredRol="ROLE_ADMIN">
                                <AdminUsersPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/users/:id/edit"
                        element={
                            <PrivateRoute requiredRol="ROLE_ADMIN">
                                <AdminUserEditPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/orders"
                        element={
                            <PrivateRoute requiredRol="ROLE_ADMIN">
                                <AdminOrdersPage />
                            </PrivateRoute>
                        }
                    />
                </Route>
            </Routes>
            </Suspense>
        </Router>
    );
}

export default AppRouter;
