import { DEMO_BANK_ACCOUNTS } from '@/features/checkout/lib/bank-transfer-accounts';
import { formatCurrency } from '@/shared/lib/format';
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
    return (
        <div>
            <ul className={styles.list}>
                {DEMO_BANK_ACCOUNTS.map((cuenta) => (
                    <li key={cuenta.numeroCuenta} className={styles.card}>
                        <h4 className={styles.cardTitle}>{cuenta.banco}</h4>
                        <dl className={styles.rows}>
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
                                <dt>RUT</dt>
                                <dd>{cuenta.rut}</dd>
                            </div>
                            <div className={styles.row}>
                                <dt>Email</dt>
                                <dd>{cuenta.email}</dd>
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
