import clsx from 'clsx';
import styles from './SoldOutBadge.module.css';

type SoldOutBadgeProps = {
    className?: string;
    /** `start` = esquina superior izquierda; `end` = superior derecha */
    placement?: 'start' | 'end';
};

export function SoldOutBadge({ className, placement = 'end' }: SoldOutBadgeProps) {
    return (
        <span
            className={clsx(
                styles.badge,
                placement === 'start' ? styles.placementStart : styles.placementEnd,
                className
            )}
        >
            Agotado
        </span>
    );
}

export default SoldOutBadge;
