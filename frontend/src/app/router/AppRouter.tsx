import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthSessionListeners } from '@/features/auth';
import { AdminLayout, ShopLayout } from '@/components/layout';
import PrivateRoute from './PrivateRoute';
import GuestRoute from './GuestRoute';
import ScrollToTop from './ScrollToTop';
import { ProfileProvider } from '@/app/providers';
import { LazyRouteFallback } from './LazyRouteFallback';

const HomePage = lazy(() => import('@/app/routes/home'));
const LoginPage = lazy(() => import('@/app/routes/auth/login'));
const RegisterPage = lazy(() => import('@/app/routes/auth/register'));
const ResetPasswordPage = lazy(() => import('@/app/routes/auth/reset-password'));
const ProfilePage = lazy(() => import('@/app/routes/profile'));
const CartPage = lazy(() => import('@/app/routes/cart'));
const CheckoutPage = lazy(() => import('@/app/routes/checkout'));
const CheckoutReturnPage = lazy(() => import('@/app/routes/checkout/webpay-return'));
const QPayProReturnPage = lazy(() => import('@/app/routes/checkout/qpaypro-return'));
const CheckoutSuccessPage = lazy(() => import('@/app/routes/checkout/success'));
const ProductPage = lazy(() => import('@/app/routes/product'));
const CatalogPage = lazy(() => import('@/app/routes/catalog'));
const CategoryPage = lazy(() => import('@/app/routes/category'));
const AdminDashboardPage = lazy(() => import('@/app/routes/admin/dashboard'));
const AdminProductsPage = lazy(() => import('@/app/routes/admin/products'));
const AdminProductNewPage = lazy(() => import('@/app/routes/admin/product-new'));
const AdminProductEditPage = lazy(() => import('@/app/routes/admin/product-edit'));
const AdminUsersPage = lazy(() => import('@/app/routes/admin/users'));
const AdminUserEditPage = lazy(() => import('@/app/routes/admin/user-edit'));
const AdminOrdersPage = lazy(() => import('@/app/routes/admin/orders'));
const AdminBranchesPage = lazy(() => import('@/app/routes/admin/branches'));
const NotFoundPage = lazy(() => import('@/app/routes/not-found'));

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
                    <Route
                        path="/register"
                        element={
                            <GuestRoute>
                                <RegisterPage />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/reset-password"
                        element={
                            <GuestRoute>
                                <ResetPasswordPage />
                            </GuestRoute>
                        }
                    />
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
                    <Route
                        path="/checkout/qpaypro/retorno"
                        element={
                            <PrivateRoute requiredRol="ROLE_CUSTOMER">
                                <QPayProReturnPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/checkout/error"
                        element={
                            <PrivateRoute requiredRol="ROLE_CUSTOMER">
                                <QPayProReturnPage />
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
                    <Route
                        path="/admin/sucursales"
                        element={
                            <PrivateRoute requiredRol="ROLE_ADMIN">
                                <AdminBranchesPage />
                            </PrivateRoute>
                        }
                    />
                </Route>

                {/* 404 Not Found (dentro de ShopLayout sin nav de categorías) */}
                <Route element={<ShopLayout showCategoriasNav={false} />}>
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
            </Suspense>
        </Router>
    );
}

export default AppRouter;
