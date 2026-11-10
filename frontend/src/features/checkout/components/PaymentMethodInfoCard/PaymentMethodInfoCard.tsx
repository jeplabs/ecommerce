import type { ReactNode } from 'react';
import styles from './PaymentMethodInfoCard.module.css';

export type PaymentMethodInfoCardProps = {
    title: string;
    badgeText?: string;
    description?: ReactNode;
    features?: ReactNode[];
    children?: ReactNode;
};

/**
 * Tarjeta de información para métodos de pago en el checkout.
 * Unifica el estilo visual (banner, badge y lista de características con checkmarks).
 */
export default function PaymentMethodInfoCard({
    title,
    badgeText,
    description,
    features = [],
    children,
}: PaymentMethodInfoCardProps) {
    return (
        <div className={styles.root}>
            <div className={styles.banner}>
                <span className={styles.logo}>{title}</span>
                {badgeText && <span className={styles.badge}>{badgeText}</span>}
            </div>

            {description && <p className={styles.text}>{description}</p>}

            {features.length > 0 && (
                <ul className={styles.features}>
                    {features.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            )}

            {children}
        </div>
    );
}
