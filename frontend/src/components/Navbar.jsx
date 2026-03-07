import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function Navbar() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [rol, setRol] = useState(null);

    const navigate = useNavigate();

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const rol = localStorage.getItem('rol');
        
        if (token) {
            setIsLoggedIn(!!token);
            setRol(rol);
        } else {
            setIsLoggedIn(false);
            setRol(null);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        setIsLoggedIn(false);
        setRol(null);
        navigate('/');
    };

    return (
        <nav>
            <Link to="/">Home</Link>
            {!isLoggedIn && (
                <>
                <Link to="/login">Iniciar sesión</Link>
                <Link to="/register">Registrarse</Link>
                </>
            )}
            {isLoggedIn &&
                <>
                    {rol === 'ROLE_CUSTOMER' &&
                    <Link to="/profile">Perfil</Link>
                    }

                    {rol === 'ROLE_ADMIN' && 
                        <Link to="/admin">Admin</Link>
                    }
                    {/* <button 
                        onClick={logout}
                    >Cerrar sesión</button> */}
                </>
            }
        </nav>
    )
}