import styles from './LazyRouteFallback.module.css';

export function LazyRouteFallback() {
    return (
        <div className={styles.root} role="status" aria-label="Cargando">
            <span className={styles.spinner} aria-hidden="true" />
        </div>
    );
}

export default LazyRouteFallback;
