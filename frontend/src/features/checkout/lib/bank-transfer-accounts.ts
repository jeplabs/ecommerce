export type BankAccountView = {
    banco: string;
    titular: string;
    tipoCuenta: string;
    numeroCuenta: string;
    rut: string;
    email: string;
};

/** Cuentas de demo para transferencia bancaria (configurar en producción vía backend o CMS). */
export const DEMO_BANK_ACCOUNTS: BankAccountView[] = [
    {
        banco: 'Banco Estado',
        titular: 'JEPLabs SpA',
        tipoCuenta: 'Cuenta corriente',
        numeroCuenta: '01234567890',
        rut: '76.123.456-7',
        email: 'pagos@jeplabs.com',
    },
    {
        banco: 'Banco Santander',
        titular: 'JEPLabs SpA',
        tipoCuenta: 'Cuenta vista',
        numeroCuenta: '98765432100',
        rut: '76.123.456-7',
        email: 'pagos@jeplabs.com',
    },
];
