import { Link } from "react-router-dom"

export default function Navbar() {
    return (
        <nav>
            <Link to="/">Home</Link>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
            <Link to="/profile">Perfil</Link>
            <Link to="/admin">Admin</Link>
        </nav>
    )
}