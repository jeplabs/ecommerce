import PaymentMethodInfoCard from '../PaymentMethodInfoCard/PaymentMethodInfoCard';

export default function SimulatedQPayProForm() {
    return (
        <PaymentMethodInfoCard
            title="QPayPro"
            badgeText="Visa · Mastercard · Guatemala"
            features={[
                'Al confirmar el pago se te redirigirá al sitio de QPayPro de forma segura para el respectivo cobro.',
                'Pago con tarjeta de crédito o débito (Visa / Mastercard).',
                'Redirección cifrada y segura a la pasarela.',
                'Comprobante con código de autorización al completar el pago.',
            ]}
        />
    );
}
