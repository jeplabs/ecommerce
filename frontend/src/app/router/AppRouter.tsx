import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthSessionListeners } from '@/features/auth';
import ShopLayout from '@/widgets/layout/ShopLayout/ShopLayout';
import AdminLayout from '@/widgets/layout/AdminLayout/AdminLayout';
import PrivateRoute from './PrivateRoute';
import GuestRoute from './GuestRoute';
import ScrollToTop from './ScrollToTop';
import { ProfileProvider } from '@/app/providers';

import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { ResetPasswordPage } from '@/pages/reset-password';
import { ProfilePage } from '@/pages/profile';
import { CartPage } from '@/pages/cart';
import { CheckoutPage } from '@/pages/checkout';
import { CheckoutSuccessPage } from '@/pages/checkout-success';
import { ProductPage } from '@/pages/product';
import { CatalogPage } from '@/pages/catalog';
import { CategoryPage } from '@/pages/category';
import { AdminDashboardPage } from '@/pages/admin/dashboard';
import { AdminProductsPage } from '@/pages/admin/products';
import { AdminProductNewPage } from '@/pages/admin/product-new';
import { AdminProductEditPage } from '@/pages/admin/product-edit';
import { AdminUsersPage } from '@/pages/admin/users';
import { AdminUserEditPage } from '@/pages/admin/user-edit';
import { AdminOrdersPage } from '@/pages/admin/orders';

export function AppRouter() {
    return (
        <Router>
            <ScrollToTop />
            <AuthSessionListeners />
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
        </Router>
    );
}

export default AppRouter;
