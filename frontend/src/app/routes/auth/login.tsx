import { LoginForm } from '@/features/auth';
import styles from '@/features/auth/components/AuthPage.module.css';

export default function LoginRoute() {
    return (
        <div className={styles.authPage}>
            <h1>Iniciar sesión</h1>
            <LoginForm />
        </div>
    );
}

