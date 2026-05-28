import { useState, useEffect, useCallback, useMemo } from 'react';
import { envioService } from '../services/envioService';
import { partitionShippingServices } from '../utils/envioHelpers';

const EMPTY_OPCIONES = {
    envioGratis: false,
    costoEnvio: null,
    montoMinimoGratis: null,
    servicios: [],
};

/**
 * Carga opciones de envío desde el API según el subtotal del carrito.
 */
export function useEnvioOpciones(subtotal) {
    const [opciones, setOpciones] = useState(EMPTY_OPCIONES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOpciones = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await envioService.getOpciones(subtotal);
            setOpciones({
                envioGratis: Boolean(data.envioGratis),
                costoEnvio: data.costoEnvio ?? null,
                montoMinimoGratis: data.montoMinimoGratis ?? null,
                servicios: Array.isArray(data.servicios) ? data.servicios : [],
            });
        } catch (err) {
            setError(err.message || 'No se pudieron cargar los servicios de envío');
            setOpciones(EMPTY_OPCIONES);
        } finally {
            setLoading(false);
        }
    }, [subtotal]);

    useEffect(() => {
        fetchOpciones();
    }, [fetchOpciones]);

    const { pickup, delivery } = useMemo(
        () => partitionShippingServices(opciones.servicios),
        [opciones.servicios]
    );

    return {
        opciones,
        servicios: opciones.servicios,
        pickupServices: pickup,
        deliveryServices: delivery,
        loading,
        error,
        refetch: fetchOpciones,
    };
}
