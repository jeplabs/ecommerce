import type { CheckoutStep } from '@/features/checkout/model/useCheckoutLogic';
import './CheckoutSteps.css';

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
        <ol className="checkout-steps" aria-label="Pasos del checkout">
            {steps.map((stepId, index) => {
                const isActive = index === currentIndex;
                const isDone = index < currentIndex;

                return (
                    <li
                        key={stepId}
                        className={`checkout-steps__item ${isActive ? 'checkout-steps__item--active' : ''} ${isDone ? 'checkout-steps__item--done' : ''}`}
                        aria-current={isActive ? 'step' : undefined}
                    >
                        <span className="checkout-steps__number">
                            {isDone ? '✓' : index + 1}
                        </span>
                        <span className="checkout-steps__label">{STEP_LABELS[stepId]}</span>
                    </li>
                );
            })}
        </ol>
    );
}
