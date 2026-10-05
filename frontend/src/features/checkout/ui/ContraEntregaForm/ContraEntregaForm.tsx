import { useCheckout } from '@/app/providers';
import PaymentMethodInfoCard from '../PaymentMethodInfoCard/PaymentMethodInfoCard';

export default function ContraEntregaForm() {
    const { selectedServicio } = useCheckout();
    const serviceName = selectedServicio?.nombre ?? 'la empresa de envío';

    return (
        <PaymentMethodInfoCard
            title="Contra entrega"
            badgeText="Pago al recibir"
            features={[
                <>
                    El valor del envío lo puedes consultar directamente con <strong>{serviceName}</strong>.
                </>,
                <>
                    El envío <strong>se paga de manera adicional al valor de la compra</strong> al recibir el producto.
                </>,
                'El pedido se enviará a la dirección de entrega indicada en la sección de direcciones.',
                <>
                    El pago <strong>se cobrará al momento de recibir el pedido</strong>.
                </>,
            ]}
        />
    );
}