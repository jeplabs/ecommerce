import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthSessionListeners } from '@/features/auth';
import ShopLayout from '@/widgets/layout/ShopLayout/ShopLayout';
import AdminLayout from '@/widgets/layout/AdminLayout/AdminLayout';
import PrivateRoute from './PrivateRoute';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import Producto from '@/pages/Producto';
import Catalogo from '@/pages/Catalogo';
import CategoriaProductos from '@/pages/CategoriaProductos';
import Admin from '@/pages/admin/Admin';
import ProductList from '@/pages/admin/ProductList';
import ProductNew from '@/pages/admin/ProductNew';
import ProductEdit from '@/pages/admin/ProductEdit';
import UsersList from '@/pages/admin/UsersList';
import UserEdit from '@/pages/admin/UserEdit';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';

export function AppRouter() {
    return (
        <Router>
            <AuthSessionListeners />
            <Routes>
                {/* Tienda: nav + categorías + footer */}
                <Route element={<ShopLayout showCategoriasNav />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/producto/:slug" element={<Producto />} />
                    <Route path="/catalogo" element={<Catalogo />} />
                    <Route path="/categoria/*" element={<CategoriaProductos />} />
                </Route>

                {/* Tienda: nav + footer (sin barra de categorías) */}
                <Route element={<ShopLayout showCategoriasNav={false} />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute requiredRol="ROLE_CUSTOMER">
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/cart"
                        element={
                            <PrivateRoute requiredRol="ROLE_CUSTOMER">
                                <Cart />
                            </PrivateRoute>
                        }
                    />
                    {/* Alias: emails del backend y enlaces antiguos → /cart */}
                    <Route path="/carrito" element={<Navigate to="/cart" replace />} />
                    <Route
                        path="/checkout"
                        element={
                            <PrivateRoute requiredRol="ROLE_CUSTOMER">
                                <Checkout />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/checkout/success"
                        element={
                            <PrivateRoute requiredRol="ROLE_CUSTOMER">
                                <CheckoutSuccess />
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
                                <Admin />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/products"
                        element={
                            <PrivateRoute requiredRol="ROLE_ADMIN">
                                <ProductList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/products/new"
                        element={
                            <PrivateRoute requiredRol="ROLE_ADMIN">
                                <ProductNew />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/products/edit/:id"
                        element={
                            <PrivateRoute requiredRol="ROLE_ADMIN">
                                <ProductEdit />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <PrivateRoute requiredRol="ROLE_ADMIN">
                                <UsersList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/users/:id/edit"
                        element={
                            <PrivateRoute requiredRol="ROLE_ADMIN">
                                <UserEdit />
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
