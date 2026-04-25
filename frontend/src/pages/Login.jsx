import Navbar from "../components/layout/Navbar/Navbar"
import LoginForm from "../components/ui/Form/LoginForm"
import Footer from "../components/layout/Footer/Footer"

function Login() {

    return (
        <>
            <Navbar />
            <br />
            <br />
            <h1>Iniciar sesión</h1>
            <LoginForm />        
            <br />
            <br />
            <Footer />
        </>
    )
}

export default Login