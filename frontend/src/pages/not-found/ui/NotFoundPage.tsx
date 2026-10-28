import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const previousTitle = document.title;
        document.title = '404 - Página no encontrada | Tienda';
        return () => {
            document.title = previousTitle;
        };
    }, []);

    return (
        <main className={styles.container} role="main" aria-labelledby="not-found-title">
            <section className={styles.card}>
                <span className={styles.badge} aria-hidden="true">
                    404
                </span>
                <h1 id="not-found-title" className={styles.title}>
                    Página no encontrada
                </h1>
                <p className={styles.description}>
                    Lo sentimos, la página que buscas no existe, ha cambiado de dirección o ya no
                    está disponible.
                </p>
                <div className={styles.actions}>
                    <Button variant="primary" onClick={() => navigate('/')}>
                        Ir al inicio
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/catalogo')}>
                        Explorar catálogo
                    </Button>
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        Volver atrás
                    </Button>
                </div>
            </section>
        </main>
    );
}

export default NotFoundPage;

