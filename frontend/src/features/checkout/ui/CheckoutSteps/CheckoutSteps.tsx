import clsx from 'clsx';
import type { CheckoutStep } from '@/features/checkout/model/useCheckoutLogic';
import styles from './CheckoutSteps.module.css';

const STEP_LABELS: Record<CheckoutStep, string> = {
    envio: 'Envío',
    pago: 'Pago',
    confirmar: 'Confirmar',
};

type CheckoutStepsProps = {
    steps: readonly CheckoutStep[];
    currentIndex: number;
};

export default function CheckoutSteps({ steps, currentIndex }: CheckoutStepsProps) {
    return (
        <ol className={styles.root} aria-label="Pasos del checkout">
            {steps.map((stepId, index) => {
                const isActive = index === currentIndex;
                const isDone = index < currentIndex;

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
                        <span className={styles.label}>{STEP_LABELS[stepId]}</span>
                    </li>
                );
            })}
        </ol>
    );
}
