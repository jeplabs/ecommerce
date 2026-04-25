import { useNavigate } from "react-router-dom"
import Navbar from "../components/layout/Navbar/Navbar"
import RegisterForm from "../components/ui/Form/RegisterForm"
import Footer from "../components/layout/Footer/Footer"

function Register() {
    const navigate = useNavigate();

    // Redireccionar a la página de login después de un registro exitoso
    const onRegisterSuccess = () => {
        navigate("/login");
    }

    return (
        <>
            <Navbar />
            <br />
            <br />
            <h1>Registrarse</h1>
            <RegisterForm onRegisterSuccess={onRegisterSuccess} />
            <br />
            <br />
            <Footer />
        </>
    )
}

export default Register