import { describe, expect, it } from 'vitest';
import {
    CHECKOUT_FLOW_LAST_INDEX,
    CHECKOUT_STEPS,
    CHECKOUT_STEP_LABELS,
    CHECKOUT_SUCCESS_STEP_INDEX,
} from './checkoutSteps';

describe('checkoutSteps', () => {
    it('define los pasos del checkout en orden y con etiquetas consistentes', () => {
        expect(CHECKOUT_STEPS).toEqual(['pedido', 'pago', 'exito']);
        expect(CHECKOUT_FLOW_LAST_INDEX).toBe(1);
        expect(CHECKOUT_SUCCESS_STEP_INDEX).toBe(2);
        expect(CHECKOUT_STEP_LABELS.pedido).toBe('Pedido y envío');
        expect(CHECKOUT_STEP_LABELS.pago).toBe('Pago');
        expect(CHECKOUT_STEP_LABELS.exito).toBe('Confirmación');
    });
});
