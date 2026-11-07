import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '@/features/auth';
import styles from '@/features/auth/components/AuthPage.module.css';

export default function RegisterRoute() {
    const navigate = useNavigate();

    return (
        <div className={styles.authPage}>
            <h1>Registrarse</h1>
            <RegisterForm onRegisterSuccess={() => navigate('/login')} />
        </div>
    );
}

