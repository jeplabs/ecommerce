import { describe, expect, it } from 'vitest';
import { DEMO_BANK_ACCOUNTS } from './bank-transfer-accounts';

describe('bank-transfer-accounts', () => {
    it('expone cuentas demo con datos bancarios completos', () => {
        expect(DEMO_BANK_ACCOUNTS.length).toBeGreaterThanOrEqual(2);

        for (const account of DEMO_BANK_ACCOUNTS) {
            expect(account.banco.trim()).not.toBe('');
            expect(account.titular.trim()).not.toBe('');
            expect(account.tipoCuenta.trim()).not.toBe('');
            expect(account.numeroCuenta.trim()).not.toBe('');
            expect(account.rut.trim()).not.toBe('');
            expect(account.email).toMatch(/@/);
        }
    });

    it('usa el mismo titular en todas las cuentas demo', () => {
        const titulares = new Set(DEMO_BANK_ACCOUNTS.map((account) => account.titular));
        expect(titulares.size).toBe(1);
        expect(titulares.has('JEPLabs SpA')).toBe(true);
    });
});
