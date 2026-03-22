import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {

    const { isAuthenticated, userRol, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <nav>
            <Link to="/">Home</Link>
            {!isAuthenticated && (
                <>
                <Link to="/login">Iniciar sesión</Link>
                <Link to="/register">Registrarse</Link>
                </>
            )}
            {isAuthenticated &&
                <>
                    {userRol === 'ROLE_CUSTOMER' &&
                    <Link to="/profile">Perfil</Link>
                    }

                    {userRol === 'ROLE_ADMIN' && 
                        <Link to="/admin">Admin</Link>
                    }
                    <button 
                        onClick={logout}
                    >Cerrar sesión</button>
                </>
            }
        </nav>
    )
}