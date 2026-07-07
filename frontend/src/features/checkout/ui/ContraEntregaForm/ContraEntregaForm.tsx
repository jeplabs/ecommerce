import { formatCurrency } from '@/shared/lib/format';

type ContraEntregaFormProps = {
    recargo: number;
};

export default function ContraEntregaForm({ recargo }: ContraEntregaFormProps) {
    return (
        <div>
            <h2>Contra entrega</h2>
            <p>
                El pedido se enviará a la dirección de entrega indicada en la sección de
                direcciones.
            </p>
            <p>
                El pago se realizará en efectivo al recibir el pedido, aplicando el recargo por
                contra entrega.
            </p>
            <p>Recargo por pago contra entrega: {formatCurrency(recargo)}</p>
        </div>
    );
}