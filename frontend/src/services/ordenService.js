/**
 * Fachada de compatibilidad: implementación en entities/order/api.
 * @deprecated Preferir `import { orderApi } from '@/entities/order'`
 */
export {
    ordenService,
    orderApi,
    listarMisOrdenes,
    obtenerOrden,
    cancelarOrden,
    crearOrden,
    listarOrdenesAdmin,
    obtenerOrdenAdmin,
    actualizarEstadoOrdenAdmin,
} from '@/entities/order/api/orderApi';
