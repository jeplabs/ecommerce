import { describe, expect, it } from 'vitest';
import {
    TRANSFER_COMPROBANTE_MAX_BYTES,
    getTransferComprobante,
    isBankTransferOrder,
    markOrderAsBankTransfer,
    saveTransferComprobante,
} from './transfer-order-storage';

describe('transfer-order-storage', () => {
    it('marca y detecta órdenes por transferencia bancaria', () => {
        expect(isBankTransferOrder(42)).toBe(false);

        markOrderAsBankTransfer(42);

        expect(isBankTransferOrder(42)).toBe(true);
        expect(isBankTransferOrder(43)).toBe(false);
    });

    it('guarda y recupera comprobante válido', async () => {
        const file = new File(['comprobante'], 'pago.png', { type: 'image/png' });

        const result = await saveTransferComprobante(99, file);

        expect(result.success).toBe(true);
        expect(getTransferComprobante(99)?.fileName).toBe('pago.png');
    });

    it('rechaza formatos no permitidos', async () => {
        const file = new File(['texto'], 'nota.txt', { type: 'text/plain' });

        const result = await saveTransferComprobante(10, file);

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toMatch(/JPG/i);
        }
    });

    it('rechaza archivos que superan el límite', async () => {
        const file = new File([new ArrayBuffer(TRANSFER_COMPROBANTE_MAX_BYTES + 1)], 'grande.pdf', {
            type: 'application/pdf',
        });

        const result = await saveTransferComprobante(10, file);

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toMatch(/2 MB/i);
        }
    });
});
