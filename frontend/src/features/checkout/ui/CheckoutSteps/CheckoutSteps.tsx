import clsx from 'clsx';
import {
    CHECKOUT_STEP_LABELS,
    type CheckoutStep,
} from '@/features/checkout/model/checkoutSteps';
import styles from './CheckoutSteps.module.css';

type CheckoutStepsProps = {
    steps: readonly CheckoutStep[];
    currentIndex: number;
    /** Marca el paso actual como completado (p. ej. confirmación tras el pago). */
    markCurrentComplete?: boolean;
};

export default function CheckoutSteps({
    steps,
    currentIndex,
    markCurrentComplete = false,
}: CheckoutStepsProps) {
    return (
        <ol className={styles.root} aria-label="Pasos del checkout">
            {steps.map((stepId, index) => {
                const isDone =
                    index < currentIndex ||
                    (markCurrentComplete && index === currentIndex);
                const isActive = index === currentIndex && !markCurrentComplete;

                return (
                    <li
                        key={stepId}
                        className={clsx(
                            styles.item,
                            isActive && styles.itemActive,
                            isDone && styles.itemDone
                        )}
                        aria-current={isActive ? 'step' : undefined}
                    >
                        <span className={styles.number}>
                            {isDone ? '✓' : index + 1}
                        </span>
                        <span className={styles.label}>{CHECKOUT_STEP_LABELS[stepId]}</span>
                    </li>
                );
            })}
        </ol>
    );
}
