import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"
import "./Navbar.css"

export default function Navbar() {
    const { isAuthenticated, userRol, logout } = useAuth();
    const navigate = useNavigate();

    // Función preparada para la búsqueda (actualmente comentada)
    const handleSearch = (e) => {
        e.preventDefault();
        const query = e.target.searchQuery.value;
        if (query.trim()) {
            // Lógica futura: navigate(`/products?search=${query}`);
            console.log("Buscando producto:", query);
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
                    <div className="auth-links">
                        <Link to="/login" className="btn-link">Iniciar sesión</Link>
                        <Link to="/register" className="btn-primary">Registrarse</Link>
                    </div>
                ) : (
                    <div className="user-menu">
                        {userRol === 'ROLE_CUSTOMER' && (
                            <Link to="/profile" className="btn-link">Perfil</Link>
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