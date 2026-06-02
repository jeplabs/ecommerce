import { formatCurrency } from '../../../utils/formatters';
import {
    formatFormaPagoEnvio,
    isPickupFromServicioNombre,
} from '../../../utils/ordenDisplayHelpers';
import { FORMA_PAGO_ENVIO } from '../../../utils/envioHelpers';
import './OrderShippingSummary.css';

/**
 * Bloque de entrega: servicio, costo, forma de pago y dirección/contacto.
 */
export default function OrderShippingSummary({ orden, className = '' }) {
    if (!orden) return null;

    const pickup = isPickupFromServicioNombre(orden.servicioEnvio);
    const direccion = orden.direccionEnvio;
    const costoEnvio = Number(orden.costoEnvio ?? 0);
    const envioGratis = costoEnvio === 0 && orden.servicioEnvio;
    const envioContraEntrega = orden.formaPago === FORMA_PAGO_ENVIO.CONTRA_ENTREGA;

    return (
        <div className={`order-shipping-summary ${className}`.trim()}>
            <section className="order-shipping-summary__block" aria-labelledby="order-shipping-service-heading">
                <h4 id="order-shipping-service-heading" className="order-shipping-summary__heading">
                    Forma de entrega
                </h4>
                <p className="order-shipping-summary__service">
                    {orden.servicioEnvio || '—'}
                </p>
                <dl className="order-shipping-summary__meta">
                    <div className="order-shipping-summary__meta-row">
                        <dt>Pago del envío</dt>
                        <dd>{formatFormaPagoEnvio(orden.formaPago)}</dd>
                    </div>
                    <div className="order-shipping-summary__meta-row">
                        <dt>Costo de envío</dt>
                        <dd className={envioGratis ? 'order-shipping-summary__free' : ''}>
                            {orden.servicioEnvio
                                ? envioGratis
                                    ? 'Gratis'
                                    : formatCurrency(costoEnvio)
                                : '—'}
                        </dd>
                    </div>
                    {envioContraEntrega && !envioGratis && costoEnvio > 0 && (
                        <div className="order-shipping-summary__meta-row">
                            <dt> </dt>
                            <dd className="order-shipping-summary__contra-note">
                                Incluye tarifa y recargo contra entrega · se paga al recibir
                            </dd>
                        </div>
                    )}
                </dl>
                {pickup && (
                    <p className="order-shipping-summary__pickup-note">
                        Retiro en tienda. Los datos de contacto corresponden a la dirección asociada al pedido.
                    </p>
                )}
            </section>

            {direccion && (
                <section
                    className="order-shipping-summary__block"
                    aria-labelledby="order-shipping-address-heading"
                >
                    <h4 id="order-shipping-address-heading" className="order-shipping-summary__heading">
                        {pickup ? 'Contacto del pedido' : 'Dirección de envío'}
                    </h4>
                    <div className="order-shipping-summary__address">
                        <p><strong>{direccion.alias}</strong></p>
                        <p>{direccion.calle}</p>
                        <p>
                            {direccion.ciudad}, {direccion.estado} {direccion.codigoPostal}
                        </p>
                        <p>{direccion.pais}</p>
                        {direccion.telefono && <p>Tel: {direccion.telefono}</p>}
                        {direccion.referencias && (
                            <p className="order-shipping-summary__refs">{direccion.referencias}</p>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
