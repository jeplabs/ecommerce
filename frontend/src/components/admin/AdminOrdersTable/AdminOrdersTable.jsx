import { useEffect, useState } from 'react';
import {
    formatCurrency,
    formatDateTime,
    formatEstadoOrden,
} from '../../../utils/formatters';
import { getOpcionesEstadoAdmin } from '../../../utils/ordenEstados';
import './AdminOrdersTable.css';

const ESTADO_CLASS = {
    PENDIENTE: 'admin-orders-table__pill--pending',
    CONFIRMADA: 'admin-orders-table__pill--confirmed',
    EN_PROCESO: 'admin-orders-table__pill--processing',
    ENVIADA: 'admin-orders-table__pill--shipped',
    ENTREGADA: 'admin-orders-table__pill--delivered',
    CANCELADA: 'admin-orders-table__pill--cancelled',
};

function AdminOrderRow({ orden, onSaveEstado, updating, onVerDetalle }) {
    const [selectedEstado, setSelectedEstado] = useState(orden.estado);

    useEffect(() => {
        setSelectedEstado(orden.estado);
    }, [orden.estado, orden.actualizadoAt]);

    const opciones = getOpcionesEstadoAdmin(orden.estado);
    const puedeCambiar = opciones.length > 1;
    const dirty = selectedEstado !== orden.estado;
    const envio = orden.direccionEnvio;
    const itemsCount = orden.items?.length ?? 0;

    return (
        <tr className="admin-orders-table__row">
            <td className="admin-orders-table__cell-id" data-label="Pedido">
                #{orden.id}
            </td>
            <td className="admin-orders-table__cell-date" data-label="Fecha">
                {formatDateTime(orden.creadoAt)}
            </td>
            <td className="admin-orders-table__cell-city" data-label="Envío">
                {envio?.ciudad || '—'}
                {envio?.pais ? `, ${envio.pais}` : ''}
            </td>
            <td className="admin-orders-table__cell-items" data-label="Ítems">
                {itemsCount}
            </td>
            <td className="admin-orders-table__cell-total" data-label="Total">
                {formatCurrency(orden.total)}
            </td>
            <td className="admin-orders-table__cell-status" data-label="Estado">
                <div className="admin-orders-table__status-body">
                    <div className="admin-orders-table__status-top-line">
                        <span
                            className={`admin-orders-table__pill ${ESTADO_CLASS[orden.estado] || ''}`}
                            aria-hidden="true"
                        >
                            {formatEstadoOrden(orden.estado)}
                        </span>
                        <div className="admin-orders-table__select-field">
                            <label
                                className="admin-orders-table__sr-only"
                                htmlFor={`estado-orden-${orden.id}`}
                            >
                                Cambiar estado del pedido {orden.id}
                            </label>
                            <select
                                id={`estado-orden-${orden.id}`}
                                className="admin-orders-table__select"
                                value={selectedEstado}
                                disabled={!puedeCambiar || updating}
                                onChange={(e) => setSelectedEstado(e.target.value)}
                            >
                                {opciones.map((val) => (
                                    <option key={val} value={val}>
                                        {formatEstadoOrden(val)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="admin-orders-table__btn-save"
                        disabled={!dirty || updating || !puedeCambiar}
                        onClick={() => onSaveEstado(orden.id, selectedEstado)}
                    >
                        {updating ? 'Guardando…' : 'Guardar'}
                    </button>
                </div>
            </td>
            <td className="admin-orders-table__cell-action" data-label="Detalle">
                <button
                    type="button"
                    className="admin-orders-table__btn-detail"
                    onClick={() => onVerDetalle(orden.id)}
                >
                    Ver detalle
                </button>
            </td>
        </tr>
    );
}

/**
 * Tabla de órdenes para administración: edición de estado acotada al flujo del backend.
 */
export default function AdminOrdersTable({
    ordenes,
    loading,
    error,
    updatingId,
    onSaveEstado,
    onVerDetalle,
}) {
    if (loading && (!ordenes || ordenes.length === 0)) {
        return (
            <div className="admin-orders-table__state admin-orders-table__state--loading">
                <p>Cargando pedidos…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-orders-table__state admin-orders-table__state--error" role="alert">
                <p>{error}</p>
            </div>
        );
    }

    if (!ordenes || ordenes.length === 0) {
        return (
            <div className="admin-orders-table__state admin-orders-table__state--empty">
                <p>No hay pedidos con el criterio seleccionado.</p>
            </div>
        );
    }

    return (
        <section className="admin-orders-table" aria-label="Pedidos de clientes">
            <div className="admin-orders-table__scroll">
                <table className="admin-orders-table__grid">
                    <thead>
                        <tr>
                            <th scope="col">Pedido</th>
                            <th scope="col">Fecha</th>
                            <th scope="col">Envío</th>
                            <th scope="col" className="admin-orders-table__col-narrow">
                                Ítems
                            </th>
                            <th scope="col">Total</th>
                            <th scope="col">Estado</th>
                            <th scope="col" className="admin-orders-table__col-action">
                                Detalle
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenes.map((orden) => (
                            <AdminOrderRow
                                key={orden.id}
                                orden={orden}
                                updating={updatingId === orden.id}
                                onSaveEstado={onSaveEstado}
                                onVerDetalle={onVerDetalle}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
