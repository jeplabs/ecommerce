import { Link } from 'react-router-dom';
import StatCard from '@/features/admin/ui/StatCard/StatCard';
import { useDashboardStats } from '@/features/admin/model/useDashboardStats';
import {
    formatCurrency,
    formatDateTime,
    formatEstadoOrden,
} from '@/shared/lib/format';
import type { OrderStatus } from '@/entities/order';
import styles from './AdminDashboardView.module.css';

const ESTADO_COLORS: Record<OrderStatus, string> = {
    PENDIENTE: '#fbbf24',
    CONFIRMADA: '#60a5fa',
    EN_PROCESO: '#a78bfa',
    ENVIADA: '#34d399',
    ENTREGADA: '#22c55e',
    CANCELADA: '#ef4444',
};

export default function AdminDashboardView() {
    const stats = useDashboardStats();

    if (stats.loading) {
        return (
            <div className={styles.state}>
                <p>Cargando estadísticas…</p>
            </div>
        );
    }

    if (stats.error) {
        return (
            <div className={styles.state} role="alert">
                <p>{stats.error}</p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <section className={styles.statGrid}>
                <StatCard title="Usuarios" value={stats.totalUsuarios} icon="👤" color="var(--indigo)" />
                {/* <StatCard title="Activos" value={stats.usuariosActivos} icon="✅" color="#22c55e" /> */}
                <StatCard title="Productos" value={stats.productosDisponibles} icon="📦" color="var(--violet)" />
                <StatCard title="Órdenes" value={stats.totalOrdenes} icon="📋" color="#fbbf24" />
            </section>

            <section className={styles.revenueGrid}>
                <StatCard title="Revenue total" value={formatCurrency(stats.revenueTotal)} icon="💰" color="#22c55e" />
                <StatCard title="Ticket promedio" value={formatCurrency(stats.ticketPromedio)} icon="🎟" color="var(--indigo)" />
            </section>

            <section className={styles.statusSection}>
                <h2 className={styles.sectionTitle}>Órdenes por estado</h2>
                <div className={styles.statusGrid}>
                    {(Object.entries(stats.ordenesPorEstado) as [OrderStatus, number][]).map(([estado, count]) => (
                        <div key={estado} className={styles.statusItem}>
                            <span
                                className={styles.statusDot}
                                style={{ backgroundColor: ESTADO_COLORS[estado] }}
                            />
                            <span className={styles.statusLabel}>{formatEstadoOrden(estado)}</span>
                            <span className={styles.statusCount}>{count}</span>
                        </div>
                    ))}
                </div>
            </section>

            {stats.ultimasOrdenes.length > 0 && (
                <section className={styles.recentSection}>
                    <div className={styles.recentHeader}>
                        <h2 className={styles.sectionTitle}>Últimas órdenes</h2>
                        <Link to="/admin/orders" className={styles.viewAll}>
                            Ver todas →
                        </Link>
                    </div>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.ultimasOrdenes.map((orden) => (
                                    <tr key={orden.id}>
                                        <td className={styles.cellId}>#{orden.id}</td>
                                        <td>{formatDateTime(orden.creadoAt)}</td>
                                        <td>{formatCurrency(orden.total)}</td>
                                        <td>
                                            <span
                                                className={styles.pill}
                                                style={{ backgroundColor: ESTADO_COLORS[orden.estado] }}
                                            >
                                                {formatEstadoOrden(orden.estado)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}
