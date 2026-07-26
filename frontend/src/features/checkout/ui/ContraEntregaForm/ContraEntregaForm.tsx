import { useCheckout } from '@/app/providers';
import { getContraEntregaShippingNote } from '@/entities/order';
import styles from './ContraEntregaForm.module.css';

export default function ContraEntregaForm() {
    const { selectedServicio } = useCheckout();
    const serviceName = selectedServicio?.nombre ?? null;

    return (
        <div className={styles.root}>
            <div className={styles.banner}>
                <span className={styles.logo}>Contra entrega</span>
                <span className={styles.badge}>Pago pendiente</span>
            </div>

            {/* {serviceName && (
                <p className={styles.text}>
                    {getContraEntregaShippingNote(serviceName)}
                </p>
            )} */}
            <ul className={styles.features}>
                <li>
                    El valor del envío lo puedes consultar directamente con <strong>{serviceName}</strong>.
                </li>
                <li>
                    El envío <strong>se paga de manera adicional al valor de la compra</strong> al recibir el producto.
                </li>
                <li>
                    El pedido se enviará a la dirección de entrega indicada en la sección de
                    direcciones.
                </li>
                <li>
                    El pago <strong>se cobrara al momento de recibir el pedido</strong>.
                </li>
            </ul>
            
        </div>
    );
}