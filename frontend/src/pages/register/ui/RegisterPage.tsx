import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '@/features/auth';
import styles from '@/pages/register/ui/RegisterPage.module.css';

export function RegisterPage() {
    const navigate = useNavigate();

    return (
        <div className={styles.authPage}>
            <h1>Registrarse</h1>
            <RegisterForm onRegisterSuccess={() => navigate('/login')} />
        </div>
    );
}

export default RegisterPage;
