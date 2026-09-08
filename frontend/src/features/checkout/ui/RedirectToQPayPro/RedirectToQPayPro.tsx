import { useEffect } from 'react';
import styles from './RedirectToQPayPro.module.css';

type RedirectToQPayProProps = {
    redirectUrl: string;
};

export default function RedirectToQPayPro({ redirectUrl }: RedirectToQPayProProps) {
    useEffect(() => {
        window.location.href = redirectUrl;
    }, [redirectUrl]);

    return (
        <div className={styles.root}>
            <div className={styles.banner}>
                <span className={styles.logo}>QPayPro</span>
                <span className={styles.badge}>Pasarela segura · Guatemala</span>
            </div>

            <p className={styles.text}>Redirigiendo al sitio seguro de QPayPro para completar tu pago…</p>

            <noscript>
                <a href={redirectUrl} className={styles.link}>
                    Continuar a QPayPro
                </a>
            </noscript>
        </div>
    );
}

