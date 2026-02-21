import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import RegisterForm from "../components/RegisterForm"

function Register() {
    const navigate = useNavigate();

    // Redireccionar a la página de login después de un registro exitoso
    const onRegisterSuccess = () => {
        navigate("/login");
    }

    return (
        <>
            <Navbar />
            <h1>Registrarse</h1>
            <RegisterForm onRegisterSuccess={onRegisterSuccess} />
        </>
    )
}

export default Register