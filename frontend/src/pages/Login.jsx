import Navbar from "../components/layout/Navbar/Navbar"
import LoginForm from "../components/ui/Form/LoginForm"

function Login() {

    return (
        <>
            <Navbar />
            <h1>Iniciar sesión</h1>
            <LoginForm />
        </>
    )
}

export default Login