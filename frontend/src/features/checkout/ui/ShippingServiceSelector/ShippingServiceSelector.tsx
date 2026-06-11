import { useCheckout } from '@/app/providers';
import clsx from 'clsx';

import { formatCurrency } from '@/shared/lib/format';
import { FORMA_PAGO_ENVIO } from '@/entities/order';
import type { FormaPago } from '@/entities/order';
import { getServicioCostos, isPickupService } from '@/entities/shipping';
import type { ShippingServiceApi } from '@/entities/shipping';
import styles from './ShippingServiceSelector.module.css';

type CostLineProps = {
    label: string;
    amount: number;
    envioGratis: boolean;
};

function CostLine({ label, amount, envioGratis }: CostLineProps) {
    return (
        <div className={styles.costLine}>
            <span className={styles.costLabel}>{label}</span>
            <span className={styles.costValue}>
                {envioGratis ? (
                    <>
                        <span className={styles.costStruck}>
                            {formatCurrency(amount)}
                        </span>
                        <span className={styles.costFree}>Gratis</span>
                    </>
                ) : (
                    formatCurrency(amount)
                )}
            </span>
        </div>
    );
}

type ServiceOptionProps = {
    servicio: ShippingServiceApi;
    selectedId: number | null;
    envioGratis: boolean;
    formaPagoEnvio: FormaPago;
    onSelect: (id: number) => void;
};

function ServiceOption({ servicio, selectedId, envioGratis, formaPagoEnvio, onSelect }: ServiceOptionProps) {
    const isSelected = selectedId === servicio.id;
    const isPickup = isPickupService(servicio);
    const { tarifa, recargo, enLinea, contraEntrega } = getServicioCostos(servicio);
    const activeTotal =
        formaPagoEnvio === FORMA_PAGO_ENVIO.CONTRA_ENTREGA ? contraEntrega : enLinea;

    return (
        <li>
            <label
                className={clsx(
                    styles.card,
                    isSelected && styles.cardSelected,
                    isPickup && styles.cardPickup
                )}
            >
                <input
                    type="radio"
                    name="servicio-envio"
                    value={servicio.id}
                    checked={isSelected}
                    onChange={() => onSelect(servicio.id)}
                />
                {servicio.logoUrl ? (
                    <img
                        src={servicio.logoUrl}
                        alt=""
                        className={styles.logo}
                    />
                ) : (
                    <span className={styles.logoPlaceholder} aria-hidden="true">
                        {isPickup ? '🏪' : '📦'}
                    </span>
                )}
                <div className={styles.body}>
                    <div className={styles.nameRow}>
                        <strong>{servicio.nombre}</strong>
                        {isSelected && !envioGratis && (
                            <span className={styles.activeTotal}>
                                {formaPagoEnvio === FORMA_PAGO_ENVIO.CONTRA_ENTREGA
                                    ? 'Contra entrega: '
                                    : 'En línea: '}
                                {formatCurrency(activeTotal)}
                            </span>
                        )}
                        {isSelected && envioGratis && (
                            <span className={clsx(styles.price, styles.priceFree)}>
                                Gratis
                            </span>
                        )}
                    </div>
                    {servicio.descripcion && (
                        <p className={styles.desc}>{servicio.descripcion}</p>
                    )}
                    <div className={styles.costs}>
                        <CostLine label="Tarifa de envío" amount={tarifa} envioGratis={envioGratis} />
                        {recargo > 0 && (
                            <CostLine
                                label="Recargo contra entrega"
                                amount={recargo}
                                envioGratis={envioGratis}
                            />
                        )}
                        <CostLine
                            label="Total en línea"
                            amount={enLinea}
                            envioGratis={envioGratis}
                        />
                        <CostLine
                            label="Total contra entrega"
                            amount={contraEntrega}
                            envioGratis={envioGratis}
                        />
                    </div>
                </div>
            </label>
        </li>
    );
}

type ServiceGroupProps = {
    label: string;
    servicios: ShippingServiceApi[];
    selectedId: number | null;
    envioGratis: boolean;
    formaPagoEnvio: FormaPago;
    onSelect: (id: number) => void;
};

function ServiceGroup({ label, servicios, selectedId, envioGratis, formaPagoEnvio, onSelect }: ServiceGroupProps) {
    if (!servicios.length) return null;

    return (
        <section className={styles.group} aria-label={label}>
            <h3 className={styles.groupLabel}>{label}</h3>
            <ul className={styles.list} role="radiogroup">
                {servicios.map((s) => (
                    <ServiceOption
                        key={s.id}
                        servicio={s}
                        selectedId={selectedId}
                        envioGratis={envioGratis}
                        formaPagoEnvio={formaPagoEnvio}
                        onSelect={onSelect}
                    />
                ))}
            </ul>
        </section>
    );
}

/**
 * Selector de servicio de envío o retiro en tienda (datos desde /api/envio/opciones).
 */
export default function ShippingServiceSelector() {
    const {
        selectedServicioEnvioId,
        setSelectedServicioEnvioId,
        isPickupSelected,
        envioOpciones,
        loadingEnvioOpciones,
        envioOpcionesError,
        refetchEnvioOpciones,
        pickupServices,
        deliveryServices,
        formaPagoEnvio,
    } = useCheckout();

    if (loadingEnvioOpciones) {
        return (
            <section className={styles.root} aria-labelledby="shipping-service-title">
                <h2 id="shipping-service-title" className={styles.title}>
                    Forma de entrega
                </h2>
                <p className={styles.loading}>Cargando opciones de envío…</p>
            </section>
        );
    }

    if (envioOpcionesError) {
        return (
            <section className={styles.root} aria-labelledby="shipping-service-title">
                <h2 id="shipping-service-title" className={styles.title}>
                    Forma de entrega
                </h2>
                <p className={styles.error} role="alert">
                    {envioOpcionesError}
                </p>
                <button
                    type="button"
                    className={styles.retry}
                    onClick={refetchEnvioOpciones}
                >
                    Reintentar
                </button>
            </section>
        );
    }

    const { envioGratis, montoMinimoGratis } = envioOpciones;
    const hasServices = pickupServices.length > 0 || deliveryServices.length > 0;

    if (!hasServices) {
        return (
            <section className={styles.root} aria-labelledby="shipping-service-title">
                <h2 id="shipping-service-title" className={styles.title}>
                    Forma de entrega
                </h2>
                <p className={styles.empty}>
                    No hay servicios de envío disponibles. Contacta a la tienda.
                </p>
            </section>
        );
    }

    return (
        <section className={styles.root} aria-labelledby="shipping-service-title">
            <h2 id="shipping-service-title" className={styles.title}>
                Forma de entrega
            </h2>
            <p className={styles.subtitle}>
                Elige retiro en tienda o un servicio de envío a domicilio.
            </p>

            {envioGratis && (
                <p className={styles.banner} role="status">
                    ¡Envío gratis en este pedido! Los valores tachados muestran el costo habitual.
                </p>
            )}

            {!envioGratis && montoMinimoGratis != null && Number(montoMinimoGratis) > 0 && (
                <p className={styles.hintFree}>
                    Compra desde {formatCurrency(montoMinimoGratis)} y obtén envío gratis.
                </p>
            )}

            <ServiceGroup
                label="Retiro en tienda"
                servicios={pickupServices}
                selectedId={selectedServicioEnvioId}
                envioGratis={envioGratis}
                formaPagoEnvio={formaPagoEnvio}
                onSelect={setSelectedServicioEnvioId}
            />

            <ServiceGroup
                label="Envío a domicilio"
                servicios={deliveryServices}
                selectedId={selectedServicioEnvioId}
                envioGratis={envioGratis}
                formaPagoEnvio={formaPagoEnvio}
                onSelect={setSelectedServicioEnvioId}
            />

            {isPickupSelected && (
                <p className={styles.pickupNote}>
                    Retirarás el pedido en nuestra tienda. La dirección seleccionada arriba se usa como
                    contacto y referencia del pedido.
                </p>
            )}
        </section>
    );
}
