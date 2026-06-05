import { useNavigate } from 'react-router-dom';
import RegisterForm from '@/shared/ui/Form/RegisterForm';

export function RegisterPage() {
    const navigate = useNavigate();

    return (
        <div className="auth-page">
            <h1>Registrarse</h1>
            <RegisterForm onRegisterSuccess={() => navigate('/login')} />
        </div>
    );
}

export default RegisterPage;
