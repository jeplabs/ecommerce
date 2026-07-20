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

            {serviceName && (
                <p className={styles.text}>
                    {getContraEntregaShippingNote(serviceName)}
                </p>
            )}
            <p className={styles.text}>
                El pedido se enviará a la dirección de entrega indicada en la sección de
                direcciones, y <strong>se cobrara el pago al momento de recibir el pedido</strong>. 
            </p>
            
        </div>
    );
}