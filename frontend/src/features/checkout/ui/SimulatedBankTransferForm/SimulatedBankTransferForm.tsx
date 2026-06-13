import BankTransferAccounts from '../BankTransferAccounts/BankTransferAccounts';
import styles from './SimulatedBankTransferForm.module.css';

export default function SimulatedBankTransferForm() {
    return (
        <div className={styles.root}>
            <div className={styles.banner}>
                <span className={styles.logo}>Transferencia bancaria</span>
                <span className={styles.badge}>Pago pendiente</span>
            </div>

            <p className={styles.text}>
                Transfiere o deposita el monto total en una de estas cuentas. Tu pedido se registrará
                como <strong>pendiente</strong> hasta que validemos el comprobante.
            </p>

            <BankTransferAccounts />
        </div>
    );
}
