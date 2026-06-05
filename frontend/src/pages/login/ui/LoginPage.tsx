import LoginForm from '@/shared/ui/Form/LoginForm';
import styles from '@/pages/login/ui/LoginPage.module.css';

export function LoginPage() {
    return (
        <div className={styles.authPage}>
            <h1>Iniciar sesión</h1>
            <LoginForm />
        </div>
    );
}

export default LoginPage;
