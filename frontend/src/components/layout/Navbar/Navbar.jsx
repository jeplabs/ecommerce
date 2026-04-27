import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"
import useClickOutside from "../../../hooks/useClickOutside";
import LoginDropdown from "../../ui/Dropdown/LoginDropdown";
import "./Navbar.css"

export default function Navbar() {
    const { isAuthenticated, userRol, logout } = useAuth();
    const navigate = useNavigate();
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useClickOutside(() => {
        setIsMenuOpen(false)
    });     
    
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);


    // Función preparada para la búsqueda (actualmente comentada)
    const handleSearch = (e) => {
        e.preventDefault();
        const query = e.target.searchQuery.value;
        if (query.trim()) {
            console.log("Buscando producto:", query);
            navigate(`/products?search=${query}`)
        }
    };

    return (
        <nav className="navbar">
            {/* Izquierda: Logo / Home */}
            <div className="navbar-left">
                <Link to="/" className="navbar-logo">JEPLabs</Link>
            </div>

            {/* Centro: Buscador */}
            <div className="navbar-center">
                <form onSubmit={handleSearch} className="search-form">
                    <input 
                        type="text" 
                        name="searchQuery" 
                        placeholder="Buscar productos..." 
                        className="search-input"
                    />
                    <button type="submit" className="search-btn" aria-label="Buscar">
                        🔍
                    </button>
                </form>
            </div>

            {/* Derecha: Autenticación y Roles */}
            <div className="navbar-right">
                {!isAuthenticated ? (
                    <div className="auth-links" ref={menuRef}>
                        {/* Botón que activa el dropdown */}
                        <button 
                            className="btn-login-trigger" 
                            onClick={toggleMenu}
                            aria-expanded={isMenuOpen}
                        >
                            Iniciar sesión
                        </button>
                        {isMenuOpen && (
                            <LoginDropdown onClose={closeMenu} />
                        )}
                        {/* <Link to="/login" className="btn-link">Iniciar sesión</Link> */}
                        {/* <Link to="/register" className="btn-primary">Registrarse</Link> */}
                        <Link to="/cart" className="btn-link">Carrito</Link>
                    </div>
                ) : (
                    <div className="user-menu">
                        {userRol === 'ROLE_CUSTOMER' && (
                        <div className="auth-links">
                            <Link to="/profile" className="btn-link">Perfil</Link>
                            <Link to="/cart" className="btn-link">Carrito</Link>
                        </div>
                        )}
                        {userRol === 'ROLE_ADMIN' && (
                            <Link to="/admin" className="btn-link">Admin</Link>
                        )}
                        <button onClick={logout} className="btn-logout">
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
}