import './CheckoutSuccessHeader.css';

type CheckoutSuccessHeaderProps = {
    orderId: number | string;
};

export default function CheckoutSuccessHeader({ orderId }: CheckoutSuccessHeaderProps) {
    return (
        <header className="checkout-success-header">
            <div className="checkout-success-header__icon" aria-hidden="true">
                ✓
            </div>
            <h1 className="checkout-success-header__title">¡Compra realizada con éxito!</h1>
            <p className="checkout-success-header__lead">
                Tu pedido{' '}
                <span className="checkout-success-header__order-id">#{orderId}</span>{' '}
                fue registrado. Revisa el resumen de tu compra y el envío a continuación.
            </p>
        </header>
    );
}
