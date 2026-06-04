import { useNavigate } from 'react-router-dom';
import RegisterForm from '@/shared/ui/Form/RegisterForm';

export default function Register() {
    const navigate = useNavigate();

    const onRegisterSuccess = () => {
        navigate('/login');
    };

    return (
        <div className="auth-page">
            <h1>Registrarse</h1>
            <RegisterForm onRegisterSuccess={onRegisterSuccess} />
        </div>
    );
}
