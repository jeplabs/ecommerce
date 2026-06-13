import { useMemo, type CSSProperties } from 'react';
import { useCheckout } from '@/app/providers';
import clsx from 'clsx';

import { formatCurrency } from '@/shared/lib/format';
import {
    getServicioCostos,
    getCheckoutShippingOptions,
    getShippingServiceDescription,
    isExpressService,
    isPickupService,
    qualifiesForFreeShipping,
} from '@/entities/shipping';
import type { ShippingServiceApi } from '@/entities/shipping';
import styles from './ShippingServiceSelector.module.css';

type ServiceOptionProps = {
    servicio: ShippingServiceApi;
    selectedId: number | null;
    envioGratis: boolean;
    onSelect: (id: number) => void;
};

function ServiceOption({ servicio, selectedId, envioGratis, onSelect }: ServiceOptionProps) {
    const isSelected = selectedId === servicio.id;
    const isPickup = isPickupService(servicio);
    const isExpress = isExpressService(servicio);
    const isFree = qualifiesForFreeShipping({ envioGratis }, servicio);
    const { enLinea } = getServicioCostos(servicio);
    const description = getShippingServiceDescription(servicio);
    const showStruckPrice = isFree && enLinea > 0;
    const showFreeLabel = isFree || (isPickup && enLinea === 0);

    return (
        <li>
            <label
                className={clsx(
                    styles.card,
                    isSelected && styles.cardSelected,
                    isPickup && styles.cardPickup,
                    isExpress && styles.cardExpress
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
                    <img src={servicio.logoUrl} alt="" className={styles.logo} />
                ) : (
                    <span className={styles.logoPlaceholder} aria-hidden="true">
                        {isPickup ? '🏪' : isExpress ? '⚡' : '📦'}
                    </span>
                )}
                <div className={styles.body}>
                    <div className={styles.nameRow}>
                        <strong>{servicio.nombre}</strong>
                        {showFreeLabel ? (
                            <span className={styles.priceWrap}>
                                {showStruckPrice && (
                                    <span className={styles.priceStruck}>
                                        {formatCurrency(enLinea)}
                                    </span>
                                )}
                                <span className={clsx(styles.priceTag, styles.priceTagFree)}>
                                    Gratis
                                </span>
                            </span>
                        ) : (
                            <span className={styles.priceTag}>{formatCurrency(enLinea)}</span>
                        )}
                    </div>
                    {isExpress && envioGratis && (
                        <span className={styles.expressNote}>No incluido en envío gratis</span>
                    )}
                    {description && <p className={styles.desc}>{description}</p>}
                </div>
            </label>
        </li>
    );
}

/**
 * Selector de forma de entrega: retiro, envío normal y express en una sola fila.
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
    } = useCheckout();

    const deliveryOptions = useMemo(
        () => getCheckoutShippingOptions(envioOpciones?.servicios ?? []),
        [envioOpciones?.servicios]
    );

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
                <button type="button" className={styles.retry} onClick={refetchEnvioOpciones}>
                    Reintentar
                </button>
            </section>
        );
    }

    const { envioGratis, montoMinimoGratis } = envioOpciones;

    if (!deliveryOptions.length) {
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
                Elige retiro en tienda, envío normal o envío express.
            </p>

            {envioGratis && (
                <p className={styles.banner} role="status">
                    ¡Envío gratis en retiro y envío normal! El envío express se cobra aparte.
                </p>
            )}

            {!envioGratis && montoMinimoGratis != null && Number(montoMinimoGratis) > 0 && (
                <p className={styles.hintFree}>
                    Compra desde {formatCurrency(montoMinimoGratis)} y obtén envío normal gratis.
                </p>
            )}

            <ul
                className={styles.optionsRow}
                role="radiogroup"
                aria-label="Opciones de entrega"
                style={{ '--option-count': deliveryOptions.length } as CSSProperties}
            >
                {deliveryOptions.map((servicio) => (
                    <ServiceOption
                        key={servicio.id}
                        servicio={servicio}
                        selectedId={selectedServicioEnvioId}
                        envioGratis={envioGratis}
                        onSelect={setSelectedServicioEnvioId}
                    />
                ))}
            </ul>

            {isPickupSelected && (
                <p className={styles.pickupNote}>
                    Retirarás el pedido en nuestra tienda. La dirección seleccionada arriba se usa como
                    contacto y referencia del pedido.
                </p>
            )}
        </section>
    );
}
