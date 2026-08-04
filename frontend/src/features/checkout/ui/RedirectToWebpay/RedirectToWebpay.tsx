import { useEffect, useRef } from 'react';
import styles from './RedirectToWebpay.module.css';

type RedirectToWebpayProps = {
    urlRedireccion: string;
    token: string;
};

export default function RedirectToWebpay({ urlRedireccion, token }: RedirectToWebpayProps) {
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        formRef.current?.submit();
    }, []);

    return (
        <div className={styles.root}>
            <div className={styles.banner}>
                <span className={styles.logo}>Webpay Plus</span>
                <span className={styles.badge}>Transbank · Redirección segura</span>
            </div>

            <p className={styles.text}>Redirigiendo a Webpay Plus para completar tu pago…</p>

            <form
                ref={formRef}
                method="POST"
                action={urlRedireccion}
                className={styles.form}
                data-testid="webpay-redirect-form"
            >
                <input type="hidden" name="token_ws" value={token} />
                <noscript>
                    <button type="submit" className={styles.button}>
                        Continuar a Webpay Plus
                    </button>
                </noscript>
            </form>
        </div>
    );
}