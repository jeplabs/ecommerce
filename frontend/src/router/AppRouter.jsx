import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Cart from '../pages/Cart';
import Producto from '../pages/Producto';
import Catalogo from '../pages/Catalogo';
import CategoriaProductos from '../pages/CategoriaProductos';
import Admin from '../pages/admin/Admin';
import ProductList from '../pages/admin/ProductList';
import ProductNew from '../pages/admin/ProductNew';
import ProductEdit from '../pages/admin/ProductEdit';
import UsersList from '../pages/admin/UsersList';
import PrivateRoute from './PrivateRoute';

export const AppRouter = () => {
    const { userRol } = useAuth();

    return (

        <Router>
            <Routes>
                {/* Rutas publicas */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/producto/:id" element={<Producto />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/categoria/:id" element={<CategoriaProductos />} />
                {/* <Route path="/categoria/:slug" element={<CategoriaProductos />} /> */}
                
                {/* Rutas para usuarios */}
                <Route 
                    path="/profile" 
                    element={
                        <PrivateRoute requiredRol='ROLE_CUSTOMER'>
                            <Profile />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/cart" 
                    element={
                        <PrivateRoute requiredRol='ROLE_CUSTOMER'>
                            <Cart />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/carrito" 
                    element={
                        <PrivateRoute requiredRol='ROLE_CUSTOMER'>
                            <Cart />
                        </PrivateRoute>
                    } 
                />

                {/* Rutas para admin */}
                <Route 
                    path="/admin" 
                    element={
                        <PrivateRoute requiredRol='ROLE_ADMIN'>
                            <Admin />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/admin/products" 
                    element={
                        <PrivateRoute requiredRol='ROLE_ADMIN'>
                            <ProductList />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/admin/products/new" 
                    element={
                        <PrivateRoute requiredRol='ROLE_ADMIN'>
                            <ProductNew />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/admin/products/edit/:id" 
                    element={
                        <PrivateRoute requiredRol='ROLE_ADMIN'>
                            <ProductEdit />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/admin/users" 
                    element={
                        <PrivateRoute requiredRol='ROLE_ADMIN'>
                            <UsersList />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
};

export default AppRouter;