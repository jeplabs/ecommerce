import { useMemo, useState, useEffect, type CSSProperties } from 'react';
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
import PickupBranchSelector, { MOCK_BRANCHES } from '../PickupBranchSelector/PickupBranchSelector';
import AddressSelectionModal from '../AddressSelectionModal/AddressSelectionModal';
import styles from './ShippingServiceSelector.module.css';
import sharedStyles from '../checkoutShared.module.css';

type ServiceOptionProps = {
    servicio: ShippingServiceApi;
    selectedId: number | null;
    envioGratis: boolean;
    formaPagoEnvio: 'EN_LINEA' | 'CONTRA_ENTREGA';
    onSelect: (id: number) => void;
};

function ServiceOption({
    servicio,
    selectedId,
    envioGratis,
    formaPagoEnvio,
    onSelect,
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
                    <div className={styles.nameRow}>
                        <span className={styles.name}>{servicio.nombre}</span>
                        {!isPickup && servicio.notaExpress && (
                            <span className={styles.expressNote}>{servicio.notaExpress}</span>
                        )}
                        {!servicio.notaExpress && isExpress && envioGratis && (
                            <span className={styles.expressNote}>No incluido en envío gratis</span>
                        )}
                    </div>
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
            </label>
        </li>
    );
}

/**
 * Selector de forma de entrega (Paso 1) con modal de selección de dirección / sucursal.
 */
export default function ShippingServiceSelector() {
    const {
        selectedServicioEnvioId,
        setSelectedServicioEnvioId,
        selectedAddressId,
        selectedBranchId,
        direcciones,
        envioOpciones,
        loadingEnvioOpciones,
        envioOpcionesError,
        refetchEnvioOpciones,
        formaPagoEnvio,
    } = useCheckout();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const deliveryOptions = useMemo(
        () => getCheckoutShippingOptions(envioOpciones?.servicios ?? []),
        [envioOpciones?.servicios]
    );

    useEffect(() => {
        if (!selectedServicioEnvioId && deliveryOptions.length > 0) {
            setSelectedServicioEnvioId(deliveryOptions[0].id);
        }
    }, [selectedServicioEnvioId, deliveryOptions, setSelectedServicioEnvioId]);

    const selectedServicio = useMemo(
        () => deliveryOptions.find((s) => s.id === selectedServicioEnvioId) ?? null,
        [deliveryOptions, selectedServicioEnvioId]
    );

    const isPickup = isPickupService(selectedServicio);
    const selectedAddress = direcciones.find((d) => d.id === selectedAddressId);
    const selectedBranch = MOCK_BRANCHES.find((b) => b.id === selectedBranchId);

    const handleServiceSelect = (id: number) => {
        const newlySelected = deliveryOptions.find((s) => s.id === id);
        const willBePickup = isPickupService(newlySelected);
        setSelectedServicioEnvioId(id);

        const hasLocation = willBePickup ? Boolean(selectedBranchId) : Boolean(selectedAddressId);
        if (!hasLocation) {
            setIsModalOpen(true);
        }
    };

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
                        ¡Felicidades! ¡Tu pedido tiene envío normal gratis! No aplica para envío express.
                    </p>
                </div>
            )}

            {!envioGratis && montoMinimoGratis != null && Number(montoMinimoGratis) > 0 && (
                <p className={styles.hintFree}>
                    ¡Compra desde <strong>{formatCurrency(montoMinimoGratis)}</strong> y obtén envío normal <strong>gratis</strong>!
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
                        formaPagoEnvio={formaPagoEnvio}
                        onSelect={handleServiceSelect}
                    />
                ))}
            </ul>

            <div className={styles.locationContainer}>
                {isPickup ? (
                    selectedBranch ? (
                        <div className={styles.selectedLocationCard}>
                            <div className={styles.locationHeader}>
                                <span className={styles.locationIcon}>🏪</span>
                                <div className={styles.locationDetails}>
                                    <strong className={styles.locationTitle}>
                                        Sucursal de retiro seleccionada
                                    </strong>
                                    <span className={styles.locationName}>{selectedBranch.nombre}</span>
                                    <span className={styles.locationSub}>{selectedBranch.direccion}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className={clsx(sharedStyles.btn, sharedStyles.btnSecondary, styles.changeBtn)}
                                onClick={() => setIsModalOpen(true)}
                            >
                                Cambiar sucursal
                            </button>
                        </div>
                    ) : (
                        <div className={styles.locationPromptCard}>
                            <div className={styles.locationHeader}>
                                <span className={styles.locationIcon}>🏪</span>
                                <div className={styles.locationDetails}>
                                    <strong className={styles.locationTitle}>
                                        Sucursal de retiro
                                    </strong>
                                    <span className={styles.locationSub}>
                                        Debes seleccionar una sucursal para retirar tu pedido.
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className={clsx(sharedStyles.btn, sharedStyles.btnPrimary, styles.selectBtn)}
                                onClick={() => setIsModalOpen(true)}
                            >
                                Seleccionar sucursal
                            </button>
                        </div>
                    )
                ) : selectedAddress ? (
                    <div className={styles.selectedLocationCard}>
                        <div className={styles.locationHeader}>
                            <span className={styles.locationIcon}>📍</span>
                            <div className={styles.locationDetails}>
                                <strong className={styles.locationTitle}>
                                    Dirección de entrega seleccionada
                                </strong>
                                <span className={styles.locationName}>
                                    {selectedAddress.alias} {selectedAddress.principal ? '(Principal)' : ''}
                                </span>
                                <span className={styles.locationSub}>
                                    {selectedAddress.direccion}, {selectedAddress.ciudad} {selectedAddress.estado}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={clsx(sharedStyles.btn, sharedStyles.btnSecondary, styles.changeBtn)}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Cambiar dirección
                        </button>
                    </div>
                ) : (
                    <div className={styles.locationPromptCard}>
                        <div className={styles.locationHeader}>
                            <span className={styles.locationIcon}>📍</span>
                            <div className={styles.locationDetails}>
                                <strong className={styles.locationTitle}>
                                    Dirección de entrega
                                </strong>
                                <span className={styles.locationSub}>
                                    Debes seleccionar una dirección para recibir tu pedido.
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={clsx(sharedStyles.btn, sharedStyles.btnPrimary, styles.selectBtn)}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Seleccionar una dirección
                        </button>
                    </div>
                )}
            </div>

            <AddressSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isPickup ? 'Seleccionar sucursal de retiro' : 'Seleccionar dirección de entrega'}
            >
                {isPickup ? <PickupBranchSelector /> : <ShippingAddressSelector />}
            </AddressSelectionModal>
        </section>
    );
}
