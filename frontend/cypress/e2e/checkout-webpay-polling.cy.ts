import { mockProduct } from '../../src/test/msw/fixtures/products';
import { MOCK_ORDER_PENDING_ID } from '../../src/test/msw/fixtures/orders-registry';

describe('Checkout WebPay — recuperación por polling (Caso 5)', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
        cy.stubAuthApi();
        cy.stubAuthenticatedApi();
        cy.loginAsCustomer();
    });

    it('completa una orden aprobada cuando el cliente vuelve al checkout', () => {
        // El cliente ya pagó y el backend confirmó la orden mientras estaba fuera.
        cy.addCartItemDirect(mockProduct.id);
        cy.setOrderEstado(MOCK_ORDER_PENDING_ID, 'CONFIRMADA');

        // El retorno desde WebPay se perdió: la app guardó el id de la orden pendiente.
        cy.window().then((win) => {
            win.sessionStorage.setItem(
                'webpay:ordenPendienteId',
                String(MOCK_ORDER_PENDING_ID)
            );
        });

        cy.visit('/cart');
        cy.wait('@getCart');
        cy.contains(mockProduct.nombre).should('be.visible');
        cy.contains('button', 'Proceder al pago').click();

        cy.wait('@getWebpayEstado');

        cy.url().should('include', '/checkout/success');
        cy.contains('h1', '¡Compra realizada con éxito!').should('be.visible');
        cy.window()
            .its('sessionStorage')
            .invoke('getItem', 'webpay:ordenPendienteId')
            .should('eq', null);
    });
});
