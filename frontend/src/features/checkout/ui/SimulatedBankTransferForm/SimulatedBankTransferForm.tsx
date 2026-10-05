import PaymentMethodInfoCard from '../PaymentMethodInfoCard/PaymentMethodInfoCard';

export default function SimulatedBankTransferForm() {
    return (
        <PaymentMethodInfoCard
            title="Transferencia bancaria"
            badgeText="Pago pendiente"
            features={[
                <>
                    Transfiere o deposita el monto total en nuestras cuentas bancarias.
                </>,
                <>
                    El pedido quedará registrado como <strong>pendiente</strong> hasta que se valide el comprobante.
                </>,
                <>
                    Realiza la transferencia o depósito y conserva tu comprobante de pago.
                </>,
                <>
                    Podrás subir el comprobante desde tu historial de pedidos para agilizar la confirmación.
                </>,
            ]}
        />
    );
}
