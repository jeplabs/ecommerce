import { useCheckout } from '@/app/providers';

import { PAYMENT_METHODS } from '@/features/checkout';
import { FORMA_PAGO_ENVIO } from '@/entities/order';
import { formatCurrency } from '@/shared/lib/format';
import { formatFormaPagoEnvio } from '@/entities/order';
import sharedStyles from '../checkoutShared.module.css';
import styles from './ConfirmStep.module.css';

export default function ConfirmStep() {
    const {
        selectedAddress,
        selectedServicio,
        selectedServicioCostos,
        isPickupSelected,
        paymentMethod,
        cartTotal,
        shippingCostDisplay,
        shippingCostInTotal,
        orderTotal,
        envioOpciones,
        formaPagoEnvio,
        notas,
        cardData,
    } = useCheckout();

    const paymentLabel =
        paymentMethod === PAYMENT_METHODS.STRIPE
            ? `Tarjeta ·••• ${(cardData.cardNumber || '').replace(/\s/g, '').slice(-4) || '****'}`
            : 'Webpay Plus (Transbank)';

    const envioGratis = Boolean(envioOpciones?.envioGratis);
    const envioContraEntrega = formaPagoEnvio === FORMA_PAGO_ENVIO.CONTRA_ENTREGA;
    const { tarifa = 0, recargo = 0 } = selectedServicioCostos || {};

    if (!selectedAddress) {
        return <p className={sharedStyles.stepLoading}>Cargando datos…</p>;
    }

    return (
        <div>
            <h2 className={sharedStyles.stepTitle}>Confirmar pedido</h2>
            <p className={sharedStyles.stepSubtitle}>Revisa los datos antes de pagar</p>

            <div className={styles.block}>
                <h3>Entrega</h3>
                {selectedServicio && (
                    <>
                        <p>
                            <strong>{selectedServicio.nombre}</strong>
                        </p>
                        <p className={styles.envioPayment}>
                            Pago del envío: {formatFormaPagoEnvio(formaPagoEnvio)}
                        </p>
                        {envioGratis ? (
                            <p className={styles.free}>
                                Envío gratis
                                {(tarifa > 0 || recargo > 0) && (
                                    <>
                                        {' '}
                                        <span className={styles.struck}>
                                            (
                                            {formatCurrency(tarifa + recargo)}
                                            )
                                        </span>
                                    </>
                                )}
                            </p>
                        ) : envioContraEntrega ? (
                            <dl className={styles.envioBreakdown}>
                                <div>
                                    <dt>Tarifa de envío</dt>
                                    <dd>{formatCurrency(tarifa)}</dd>
                                </div>
                                {recargo > 0 && (
                                    <div>
                                        <dt>Recargo contra entrega</dt>
                                        <dd>{formatCurrency(recargo)}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt>Total envío al recibir</dt>
                                    <dd>{formatCurrency(shippingCostDisplay)}</dd>
                                </div>
                            </dl>
                        ) : (
                            <p>Envío en línea: {formatCurrency(shippingCostInTotal)}</p>
                        )}
                    </>
                )}
                {isPickupSelected ? (
                    <p className={styles.pickupHint}>Retiro en tienda</p>
                ) : (
                    <>
                        <p><strong>{selectedAddress.alias}</strong></p>
                        <p>{selectedAddress.direccion}</p>
                        <p>
                            {selectedAddress.ciudad}, {selectedAddress.estado}{' '}
                            {selectedAddress.codigoPostal}
                        </p>
                        <p>{selectedAddress.pais} · {selectedAddress.telefono}</p>
                    </>
                )}
                {isPickupSelected && (
                    <p className={styles.contact}>
                        Contacto: {selectedAddress.alias} · {selectedAddress.telefono}
                    </p>
                )}
            </div>

            <div className={styles.block}>
                <h3>Pago de productos</h3>
                <p>{paymentLabel}</p>
                <p className={styles.amount}>
                    Subtotal productos: {formatCurrency(cartTotal)}
                </p>
                {!envioGratis && !envioContraEntrega && shippingCostInTotal > 0 && (
                    <p className={styles.amount}>
                        Envío (en línea): {formatCurrency(shippingCostInTotal)}
                    </p>
                )}
                <p className={styles.amount}>
                    Total a pagar ahora: <strong>{formatCurrency(orderTotal)}</strong>
                </p>
                {!envioGratis && envioContraEntrega && shippingCostDisplay > 0 && (
                    <p className={styles.contraNote}>
                        El envío ({formatCurrency(shippingCostDisplay)}) se paga al recibir el pedido.
                    </p>
                )}
            </div>

            {notas.trim() && (
                <div className={styles.block}>
                    <h3>Notas</h3>
                    <p>{notas}</p>
                </div>
            )}

            <p className={styles.disclaimer}>
                Al hacer clic en «Pagar y confirmar» se procesará el pago simulado y se creará tu orden en el sistema.
            </p>
        </div>
    );
}
