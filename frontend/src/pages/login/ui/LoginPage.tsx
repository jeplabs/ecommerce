import LoginForm from '@/shared/ui/Form/LoginForm';

export function LoginPage() {
    return (
        <div className="auth-page">
            <h1>Iniciar sesión</h1>
            <LoginForm />
        </div>
    );
}

export default LoginPage;
