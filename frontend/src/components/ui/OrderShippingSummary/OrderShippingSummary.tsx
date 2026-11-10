import clsx from 'clsx';
import { formatCurrency } from '@/utils/format';
import styles from './OrderShippingSummary.module.css';

export type OrderShippingAddressSummary = {
    alias: string;
    calle: string;
    ciudad: string;
    estado: string;
    codigoPostal?: string | null;
    pais: string;
    telefono?: string | null;
    horario?: string | null;
    referencias?: string | null;
};

export type OrderShippingSummaryData = {
    sucursalId?: number | null;
    servicioEnvio?: string | null;
    costoEnvio?: number | string | null;
    formaPagoEnvio: 'EN_LINEA' | 'CONTRA_ENTREGA' | string;
    direccionEnvio?: OrderShippingAddressSummary | null;
};

export type OrderShippingSummaryProps = {
    orden: OrderShippingSummaryData | null | undefined;
    className?: string;
    embedded?: boolean;
};

function isPickupServiceName(nombre: string | null | undefined): boolean {
    if (!nombre) return false;
    return nombre.toLowerCase().includes('retiro');
}

function formatContraEntregaNote(servicioEnvio: string): string {
    return `El envío se paga de manera adicional al valor de la compra al recibir el producto. El valor del envío lo puedes consultar directamente con ${servicioEnvio}.`;
}

/**
 * Bloque de entrega compartido entre Checkout (confirmación) y Perfil (detalle de orden):
 * muestra servicio, costo, forma de pago y dirección o sucursal de retiro.
 */
export default function OrderShippingSummary({
    orden,
    className,
    embedded = false,
}: OrderShippingSummaryProps) {
    if (!orden) return null;

    const pickup = isPickupServiceName(orden.servicioEnvio) || Boolean(orden.sucursalId);
    const direccion = orden.direccionEnvio;
    const costoEnvio = Number(orden.costoEnvio ?? 0);
    const isContraEntrega = orden.formaPagoEnvio === 'CONTRA_ENTREGA';
    const envioGratis = costoEnvio === 0 && Boolean(orden.servicioEnvio) && !isContraEntrega;

    return (
        <div className={clsx(styles.root, embedded && styles.embedded, className)}>
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
                                ? isContraEntrega
                                    ? formatContraEntregaNote(orden.servicioEnvio)
                                    : envioGratis
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
                        {pickup ? 'Sucursal de retiro' : 'Dirección de envío'}
                    </h4>
                    <div className={styles.address}>
                        <p><strong>{direccion.alias}</strong></p>
                        <p>{direccion.calle}</p>
                        <p>
                            {direccion.ciudad}, {direccion.estado} {direccion.codigoPostal}
                        </p>
                        <p>{direccion.pais}</p>
                        {direccion.telefono && <p>Tel: {direccion.telefono}</p>}
                        {direccion.horario && <p>Horario: {direccion.horario}</p>}
                        {direccion.referencias && (
                            <p className={styles.refs}>{direccion.referencias}</p>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
