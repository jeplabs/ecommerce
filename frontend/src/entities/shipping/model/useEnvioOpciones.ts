import { useState, useEffect, useCallback, useMemo } from 'react';
import { shippingApi } from '../api';
import { partitionShippingServices } from './mappers';
import type { EnvioOpcionesState, UseEnvioOpcionesResult } from './types';

const EMPTY_OPCIONES: EnvioOpcionesState = {
    envioGratis: false,
    costoEnvio: null,
    montoMinimoGratis: null,
    servicios: [],
};

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

/**
 * Carga opciones de envío desde el API según el subtotal del carrito.
 */
export function useEnvioOpciones(subtotal: number): UseEnvioOpcionesResult {
    const [opciones, setOpciones] = useState<EnvioOpcionesState>(EMPTY_OPCIONES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOpciones = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await shippingApi.getOpciones(subtotal);
            setOpciones({
                envioGratis: Boolean(data.envioGratis),
                costoEnvio: data.costoEnvio ?? null,
                montoMinimoGratis: data.montoMinimoGratis ?? null,
                servicios: Array.isArray(data.servicios) ? data.servicios : [],
            });
        } catch (err) {
            setError(toErrorMessage(err) || 'No se pudieron cargar los servicios de envío');
            setOpciones(EMPTY_OPCIONES);
        } finally {
            setLoading(false);
        }
    }, [subtotal]);

    useEffect(() => {
        void fetchOpciones();
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
