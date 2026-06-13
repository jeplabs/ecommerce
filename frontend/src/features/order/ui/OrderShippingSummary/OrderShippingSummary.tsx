import clsx from 'clsx';
import { formatCurrency } from '@/shared/lib/format';
import { isPickupFromServicioNombre } from '@/entities/order';
import type { OrderApi } from '@/entities/order';
import styles from './OrderShippingSummary.module.css';

type OrderShippingSummaryProps = {
    orden: OrderApi | null | undefined;
    className?: string;
};

/**
 * Bloque de entrega: servicio, costo, forma de pago y dirección/contacto.
 */
export default function OrderShippingSummary({ orden, className }: OrderShippingSummaryProps) {
    if (!orden) return null;

    const pickup = isPickupFromServicioNombre(orden.servicioEnvio);
    const direccion = orden.direccionEnvio;
    const costoEnvio = Number(orden.costoEnvio ?? 0);
    const envioGratis = costoEnvio === 0 && orden.servicioEnvio;

    return (
        <div className={clsx(styles.root, className)}>
            <section className={styles.block} aria-labelledby="order-shipping-service-heading">
                <h4 id="order-shipping-service-heading" className={styles.heading}>
                    Forma de entrega
                </h4>
                <p className={styles.service}>
                    {orden.servicioEnvio || '—'}
                </p>
                <dl className={styles.meta}>
                    <div className={styles.metaRow}>
                        <dt>Costo de envío</dt>
                        <dd className={clsx(envioGratis && styles.free)}>
                            {orden.servicioEnvio
                                ? envioGratis
                                    ? 'Gratis'
                                    : formatCurrency(costoEnvio)
                                : '—'}
                        </dd>
                    </div>
                </dl>
                {pickup && (
                    <p className={styles.pickupNote}>
                        Retiro en tienda. Los datos de contacto corresponden a la dirección asociada al pedido.
                    </p>
                )}
            </section>

            {direccion && (
                <section
                    className={styles.block}
                    aria-labelledby="order-shipping-address-heading"
                >
                    <h4 id="order-shipping-address-heading" className={styles.heading}>
                        {pickup ? 'Contacto del pedido' : 'Dirección de envío'}
                    </h4>
                    <div className={styles.address}>
                        <p><strong>{direccion.alias}</strong></p>
                        <p>{direccion.calle}</p>
                        <p>
                            {direccion.ciudad}, {direccion.estado} {direccion.codigoPostal}
                        </p>
                        <p>{direccion.pais}</p>
                        {direccion.telefono && <p>Tel: {direccion.telefono}</p>}
                        {direccion.referencias && (
                            <p className={styles.refs}>{direccion.referencias}</p>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
