import styles from './StatCard.module.css';

type StatCardProps = {
    title: string;
    value: number | string;
    color?: string;
    icon?: string;
    loading?: boolean;
};

export default function StatCard({ title, value, color, icon, loading }: StatCardProps) {
    return (
        <article className={styles.card} style={color ? { borderColor: color } : undefined}>
            <div className={styles.header}>
                {icon && <span className={styles.icon}>{icon}</span>}
                <span className={styles.title}>{title}</span>
            </div>
            <div className={styles.body}>
                {loading ? (
                    <span className={styles.skeleton} />
                ) : (
                    <span className={styles.value} style={color ? { color } : undefined}>
                        {typeof value === 'number' ? value.toLocaleString('es-MX') : value}
                    </span>
                )}
            </div>
        </article>
    );
}
