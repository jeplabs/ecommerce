import { useMemo, useState, useEffect, type CSSProperties, type ReactNode } from 'react';
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
import ShippingAddressSelector from '../ReviewAndShippingStep/ShippingAddressSelector';
import PickupBranchSelector from '../PickupBranchSelector/PickupBranchSelector';
import styles from './ShippingServiceSelector.module.css';
import sharedStyles from '../checkoutShared.module.css';

type ServiceOptionProps = {
    servicio: ShippingServiceApi;
    selectedId: number | null;
    envioGratis: boolean;
    formaPagoEnvio: 'EN_LINEA' | 'CONTRA_ENTREGA';
    onSelect: (id: number) => void;
    children?: ReactNode | ((isExpanded: boolean, onToggle: () => void) => ReactNode);
};

function ServiceOption({
    servicio,
    selectedId,
    envioGratis,
    formaPagoEnvio,
    onSelect,
    children,
}: ServiceOptionProps) {
    const isSelected = selectedId === servicio.id;
    const isPickup = isPickupService(servicio);
    const isExpress = isExpressService(servicio);
    const isFree = qualifiesForFreeShipping({ envioGratis }, servicio);
    const { enLinea, contraEntrega } = getServicioCostos(servicio);
    const displayCost = formaPagoEnvio === 'CONTRA_ENTREGA' ? contraEntrega : enLinea;
    const description = getShippingServiceDescription(servicio);
    const showStruckPrice = isFree && enLinea > 0;
    const showFreeLabel = isFree || (isPickup && enLinea === 0);

    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        if (isSelected) {
            setIsExpanded(true);
        }
    }, [isSelected]);

    const handleToggle = () => setIsExpanded((prev) => !prev);

    return (
        <li className={styles.optionItem}>
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
                    className={styles.radioInput}
                />
                {servicio.logoUrl ? (
                    <img src={servicio.logoUrl} alt="" className={styles.logo} />
                ) : (
                    <span className={styles.logoPlaceholder} aria-hidden="true">
                        {isPickup ? '🏪' : isExpress ? '⚡' : '📦'}
                    </span>
                )}
                <div className={styles.body}>
                    <strong className={styles.name}>{servicio.nombre}</strong>
                    {servicio.notaExpress && (
                        <span className={styles.expressNote}>{servicio.notaExpress}</span>
                    )}
                    {!servicio.notaExpress && isExpress && envioGratis && (
                        <span className={styles.expressNote}>No incluido en envío gratis</span>
                    )}
                    {description && <p className={styles.desc}>{description}</p>}
                </div>

                <div className={styles.priceContainer}>
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
                        <span className={styles.priceTag}>{formatCurrency(displayCost)}</span>
                    )}
                </div>

                <button
                    type="button"
                    className={clsx(styles.toggleBtn, isSelected && styles.toggleBtnActive)}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isSelected) {
                            onSelect(servicio.id);
                        } else {
                            handleToggle();
                        }
                    }}
                    aria-label={isSelected && isExpanded ? 'Contraer opciones' : 'Desplegar opciones'}
                    title={isSelected && isExpanded ? 'Contraer' : 'Desplegar'}
                >
                    <svg
                        className={clsx(
                            styles.chevronIcon,
                            (!isSelected || !isExpanded) && styles.chevronRotated
                        )}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="18 15 12 9 6 15" />
                    </svg>
                </button>
            </label>

            {isSelected && isExpanded && children && (
                <div className={styles.accordionPanel}>
                    {typeof children === 'function' ? children(isExpanded, handleToggle) : children}
                </div>
            )}
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
        envioOpciones,
        loadingEnvioOpciones,
        envioOpcionesError,
        refetchEnvioOpciones,
        formaPagoEnvio,
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
            <h2 id="shipping-service-title" className={sharedStyles.stepTitle}>
                Forma de entrega
            </h2>
            <p className={styles.subtitle}>
                Elige cómo quieres recibir tu pedido: retiro en tienda, envío normal o envío express.
            </p>

            {envioGratis && (
                <div className={styles.bannerContainer}>
                    <p className={styles.banner} role="status">
                        ¡Felicidades! ¡Tu pedido tiene envío normal gratis!
                    </p>
                    <p className={styles.hintFree}>
                        El servicio de envío express siempre se cobra.
                    </p>
                </div>
            )}

            {!envioGratis && montoMinimoGratis != null && Number(montoMinimoGratis) > 0 && (
                <p className={styles.hintFree}>
                    ¡Compra desde <strong>{formatCurrency(montoMinimoGratis)}</strong> y obtén envío normal <strong>gratis</strong>!
                </p>
            )}
            {/* {isPickupSelected && (
                <p className={styles.pickupNote}>
                    Retirarás el pedido en nuestra tienda. La dirección seleccionada arriba se usa como
                    contacto y referencia del pedido.
                </p>
            )} */}
            
            <ul
                className={styles.optionsRow}
                role="radiogroup"
                aria-label="Opciones de entrega"
                style={{ '--option-count': deliveryOptions.length } as CSSProperties}
            >
                {deliveryOptions.map((servicio) => {
                    const isSelected = selectedServicioEnvioId === servicio.id;
                    const isPickup = isPickupService(servicio);

                    return (
                        <ServiceOption
                            key={servicio.id}
                            servicio={servicio}
                            selectedId={selectedServicioEnvioId}
                            envioGratis={envioGratis}
                            formaPagoEnvio={formaPagoEnvio}
                            onSelect={setSelectedServicioEnvioId}
                        >
                            {(isExpanded, onToggle) =>
                                isPickup ? (
                                    <PickupBranchSelector isExpanded={isExpanded} onToggle={onToggle} />
                                ) : (
                                    <ShippingAddressSelector isExpanded={isExpanded} onToggle={onToggle} />
                                )
                            }
                        </ServiceOption>
                    );
                })}
            </ul>

        </section>
    );
}
