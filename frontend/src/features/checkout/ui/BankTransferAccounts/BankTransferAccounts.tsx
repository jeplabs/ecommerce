// import { DEMO_BANK_ACCOUNTS } from '@/features/checkout/lib/bank-transfer-accounts';
import { useState, useEffect } from 'react';
import { listarCuentasBancarias } from '@/entities/order';
import { formatCurrency } from '@/shared/lib/format';
import type { BancoAccountApi } from '@/entities/order/model/schemas/api';
import styles from './BankTransferAccounts.module.css';

type BankTransferAccountsProps = {
    orderId?: number;
    total?: number;
    compact?: boolean;
};

export default function BankTransferAccounts({
    orderId,
    total,
    compact = false,
}: BankTransferAccountsProps) {
    const [cuentas, setCuentas] = useState<BancoAccountApi[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        listarCuentasBancarias()
            .then(setCuentas)
            .catch((error => {
                console.error('Error al listar cuentas bancarias', error);
                setCuentas([]);
            }))
            .finally(() => setLoading(false))
    }, []);

    if (loading) {
        return <div className={styles.loader}>Cargando cuentas bancarias…</div>;
    }

    return (
        <div>
            <ul className={styles.list}>
                {cuentas.map((cuenta) => (
                    <li key={cuenta.numeroCuenta} className={styles.card}>
                        <h4 className={styles.cardTitle}>{cuenta.banco}</h4>
                        <dl className={styles.rows}>
                            <div className={styles.row}>
                                <dt>Banco</dt>
                                <dd>{cuenta.banco}</dd>
                            </div>
                            <div className={styles.row}>
                                <dt>Titular</dt>
                                <dd>{cuenta.titular}</dd>
                            </div>
                            <div className={styles.row}>
                                <dt>Tipo</dt>
                                <dd>{cuenta.tipoCuenta}</dd>
                            </div>
                            <div className={styles.row}>
                                <dt>Nº cuenta</dt>
                                <dd>{cuenta.numeroCuenta}</dd>
                            </div>
                            <div className={styles.row}>
                                <dt>Moneda</dt>
                                <dd>{cuenta.moneda}</dd>
                            </div>
                        </dl>
                    </li>
                ))}
            </ul>
            {!compact && (
                <p className={styles.hint}>
                    {orderId != null && total != null ? (
                        <>
                            Indica en el asunto o mensaje: <strong>Pedido #{orderId}</strong> · Monto:{' '}
                            <strong>{formatCurrency(total)}</strong>
                        </>
                    ) : (
                        <>
                            Realiza la transferencia o depósito y conserva el comprobante. El pedido
                            quedará en estado pendiente hasta confirmar el pago.
                        </>
                    )}
                </p>
            )}
        </div>
    );
}
