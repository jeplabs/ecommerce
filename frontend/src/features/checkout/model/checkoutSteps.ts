export const CHECKOUT_STEPS = ['pedido', 'pago', 'exito'] as const;

export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

export const CHECKOUT_STEP_LABELS: Record<CheckoutStep, string> = {
    pedido: 'Pedido y envío',
    pago: 'Pago',
    exito: 'Confirmación',
};

/** Índice del paso de confirmación (ruta /checkout/success). */
export const CHECKOUT_SUCCESS_STEP_INDEX = 2;

/** Pasos con formulario interactivo (antes de la confirmación). */
export const CHECKOUT_FLOW_LAST_INDEX = 1;
