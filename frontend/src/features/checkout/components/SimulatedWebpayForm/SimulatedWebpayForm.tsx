import PaymentMethodInfoCard from '../PaymentMethodInfoCard/PaymentMethodInfoCard';

export default function SimulatedWebpayForm() {
    return (
        <PaymentMethodInfoCard
            title="Webpay Plus"
            badgeText="Transbank · Chile"
            features={[
                <>
                    Al confirmar serás redirigido al sitio seguro de{' '}
                    <strong>Webpay Plus (Transbank)</strong>.
                </>,
                'No ingresas tu tarjeta ni datos sensibles en nuestra tienda.',
                'Al volver del sitio de Transbank, el resultado del pago se confirmará automáticamente.',
            ]}
        />
    );
}
