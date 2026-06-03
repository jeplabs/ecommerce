import Navbar from '@/widgets/layout/Navbar/Navbar'
import LoginForm from '@/shared/ui/Form/LoginForm'
import Footer from '@/widgets/layout/Footer/Footer'

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