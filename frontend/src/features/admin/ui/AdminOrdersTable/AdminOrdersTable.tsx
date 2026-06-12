import { useEffect, useState } from 'react';
import clsx from 'clsx';
import {
    formatCurrency,
    formatDateTime,
    formatEstadoOrden,
} from '@/shared/lib/format';
import { getOpcionesEstadoAdmin } from '@/entities/order';
import type { OrderApi, OrderStatus } from '@/entities/order';
import { Select } from '@/shared/ui/Select';
import styles from './AdminOrdersTable.module.css';

const ESTADO_CLASS: Partial<Record<OrderStatus, string>> = {
    PENDIENTE: styles.pillPending,
    CONFIRMADA: styles.pillConfirmed,
    EN_PROCESO: styles.pillProcessing,
    ENVIADA: styles.pillShipped,
    ENTREGADA: styles.pillDelivered,
    CANCELADA: styles.pillCancelled,
};

type AdminOrderRowProps = {
    orden: OrderApi;
    onSaveEstado: (ordenId: number, nuevoEstado: OrderStatus) => void;
    updating: boolean;
    onVerDetalle: (ordenId: number) => void;
};

function AdminOrderRow({ orden, onSaveEstado, updating, onVerDetalle }: AdminOrderRowProps) {
    const [selectedEstado, setSelectedEstado] = useState<OrderStatus>(orden.estado);

    useEffect(() => {
        setSelectedEstado(orden.estado);
    }, [orden.estado, orden.actualizadoAt]);

    const opciones = getOpcionesEstadoAdmin(orden.estado);
    const puedeCambiar = opciones.length > 1;
    const dirty = selectedEstado !== orden.estado;
    const itemsCount = orden.items?.length ?? 0;

    return (
        <tr className={styles.row}>
            <td className={styles.cellId} data-label="Pedido">
                #{orden.id}
            </td>
            <td className={styles.cellDate} data-label="Fecha">
                {formatDateTime(orden.creadoAt)}
            </td>
            <td className={styles.cellItems} data-label="Ítems">
                {itemsCount}
            </td>
            <td className={styles.cellTotal} data-label="Total">
                {formatCurrency(orden.total)}
            </td>
            <td className={styles.cellStatus} data-label="Estado">
                <div className={styles.statusBody}>
                    <div className={styles.statusTopLine}>
                        <span
                            className={clsx(styles.pill, ESTADO_CLASS[orden.estado])}
                            aria-hidden="true"
                        >
                            {formatEstadoOrden(orden.estado)}
                        </span>
                        <div className={styles.selectField}>
                            <label
                                className={styles.srOnly}
                                htmlFor={`estado-orden-${orden.id}`}
                            >
                                Cambiar estado del pedido {orden.id}
                            </label>
                            <Select
                                id={`estado-orden-${orden.id}`}
                                className={styles.select}
                                value={selectedEstado}
                                disabled={!puedeCambiar || updating}
                                onChange={(e) => setSelectedEstado(e.target.value as OrderStatus)}
                            >
                                {opciones.map((val) => (
                                    <option key={val} value={val}>
                                        {formatEstadoOrden(val)}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={styles.btnSave}
                        disabled={!dirty || updating || !puedeCambiar}
                        onClick={() => onSaveEstado(orden.id, selectedEstado)}
                    >
                        {updating ? 'Guardando…' : 'Guardar'}
                    </button>
                </div>
            </td>
            <td className={styles.cellAction} data-label="Detalle">
                <button
                    type="button"
                    className={styles.btnDetail}
                    onClick={() => onVerDetalle(orden.id)}
                >
                    Ver detalle
                </button>
            </td>
        </tr>
    );
}

type AdminOrdersTableProps = {
    ordenes: OrderApi[];
    loading: boolean;
    error: string | null;
    updatingId: number | null;
    onSaveEstado: (ordenId: number, nuevoEstado: OrderStatus) => void;
    onVerDetalle: (ordenId: number) => void;
};

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
}: AdminOrdersTableProps) {
    if (loading && (!ordenes || ordenes.length === 0)) {
        return (
            <div className={clsx(styles.state, styles.stateLoading)}>
                <p>Cargando pedidos…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={clsx(styles.state, styles.stateError)} role="alert">
                <p>{error}</p>
            </div>
        );
    }

    if (!ordenes || ordenes.length === 0) {
        return (
            <div className={clsx(styles.state, styles.stateEmpty)}>
                <p>No hay pedidos con el criterio seleccionado.</p>
            </div>
        );
    }

    return (
        <section className={styles.root} aria-label="Pedidos de clientes">
            <div className={styles.scroll}>
                <table className={styles.grid}>
                    <thead>
                        <tr>
                            <th scope="col">Pedido</th>
                            <th scope="col">Fecha</th>
                            <th scope="col" className={styles.colNarrow}>
                                Ítems
                            </th>
                            <th scope="col">Total</th>
                            <th scope="col">Estado</th>
                            <th scope="col" className={styles.colAction}>
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
