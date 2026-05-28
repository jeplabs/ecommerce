import { useCheckout } from '../../../context/CheckoutContext';
import { formatCurrency } from '../../../utils/formatters';
import { isPickupService } from '../../../utils/envioHelpers';
import './ShippingServiceSelector.css';

function ServiceOption({ servicio, selectedId, envioGratis, formaPago, onSelect }) {
    const isSelected = selectedId === servicio.id;
    const isPickup = isPickupService(servicio);
    const price =
        envioGratis
            ? 0
            : formaPago === 'CONTRA_ENTREGA'
              ? Number(servicio.costoContraEntrega ?? 0)
              : Number(servicio.costoEnLinea ?? servicio.tarifa ?? 0);

    return (
        <li>
            <label
                className={`shipping-service-selector__card ${isSelected ? 'shipping-service-selector__card--selected' : ''} ${isPickup ? 'shipping-service-selector__card--pickup' : ''}`}
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
                        className="shipping-service-selector__logo"
                    />
                ) : (
                    <span className="shipping-service-selector__logo-placeholder" aria-hidden="true">
                        {isPickup ? '🏪' : '📦'}
                    </span>
                )}
                <div className="shipping-service-selector__body">
                    <div className="shipping-service-selector__name-row">
                        <strong>{servicio.nombre}</strong>
                        <span
                            className={`shipping-service-selector__price ${envioGratis ? 'shipping-service-selector__price--free' : ''}`}
                        >
                            {envioGratis ? 'Gratis' : formatCurrency(price)}
                        </span>
                    </div>
                    {servicio.descripcion && (
                        <p className="shipping-service-selector__desc">{servicio.descripcion}</p>
                    )}
                </div>
            </label>
        </li>
    );
}

function ServiceGroup({ label, servicios, selectedId, envioGratis, formaPago, onSelect }) {
    if (!servicios.length) return null;

    return (
        <section className="shipping-service-selector__group" aria-label={label}>
            <h3 className="shipping-service-selector__group-label">{label}</h3>
            <ul className="shipping-service-selector__list" role="radiogroup">
                {servicios.map((s) => (
                    <ServiceOption
                        key={s.id}
                        servicio={s}
                        selectedId={selectedId}
                        envioGratis={envioGratis}
                        formaPago={formaPago}
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
        formaPago,
    } = useCheckout();

    if (loadingEnvioOpciones) {
        return (
            <section className="shipping-service-selector" aria-labelledby="shipping-service-title">
                <h2 id="shipping-service-title" className="shipping-service-selector__title">
                    Forma de entrega
                </h2>
                <p className="shipping-service-selector__loading">Cargando opciones de envío…</p>
            </section>
        );
    }

    if (envioOpcionesError) {
        return (
            <section className="shipping-service-selector" aria-labelledby="shipping-service-title">
                <h2 id="shipping-service-title" className="shipping-service-selector__title">
                    Forma de entrega
                </h2>
                <p className="shipping-service-selector__error" role="alert">
                    {envioOpcionesError}
                </p>
                <button
                    type="button"
                    className="shipping-service-selector__retry"
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
            <section className="shipping-service-selector" aria-labelledby="shipping-service-title">
                <h2 id="shipping-service-title" className="shipping-service-selector__title">
                    Forma de entrega
                </h2>
                <p className="shipping-service-selector__empty">
                    No hay servicios de envío disponibles. Contacta a la tienda.
                </p>
            </section>
        );
    }

    return (
        <section className="shipping-service-selector" aria-labelledby="shipping-service-title">
            <h2 id="shipping-service-title" className="shipping-service-selector__title">
                Forma de entrega
            </h2>
            <p className="shipping-service-selector__subtitle">
                Elige retiro en tienda o un servicio de envío a domicilio.
            </p>

            {envioGratis && (
                <p className="shipping-service-selector__banner" role="status">
                    ¡Envío gratis en este pedido!
                </p>
            )}

            {!envioGratis && montoMinimoGratis != null && Number(montoMinimoGratis) > 0 && (
                <p className="shipping-service-selector__hint-free">
                    Compra desde {formatCurrency(montoMinimoGratis)} y obtén envío gratis.
                </p>
            )}

            <ServiceGroup
                label="Retiro en tienda"
                servicios={pickupServices}
                selectedId={selectedServicioEnvioId}
                envioGratis={envioGratis}
                formaPago={formaPago}
                onSelect={setSelectedServicioEnvioId}
            />

            <ServiceGroup
                label="Envío a domicilio"
                servicios={deliveryServices}
                selectedId={selectedServicioEnvioId}
                envioGratis={envioGratis}
                formaPago={formaPago}
                onSelect={setSelectedServicioEnvioId}
            />

            {isPickupSelected && (
                <p className="shipping-service-selector__pickup-note">
                    Retirarás el pedido en nuestra tienda. La dirección seleccionada arriba se usa como
                    contacto y referencia del pedido.
                </p>
            )}
        </section>
    );
}
