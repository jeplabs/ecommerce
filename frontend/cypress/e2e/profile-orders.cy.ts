import {
    MOCK_ORDER_PENDING_ID,
    MOCK_ORDER_TRANSFER_ID,
} from '../../src/test/msw/fixtures/orders-registry';

describe('Pedidos del perfil', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
        cy.stubAuthApi();
        cy.stubAuthenticatedApi();
        cy.loginAsCustomer();
    });

    it('abre detalle y cancela un pedido pendiente', () => {
        cy.visit('/profile/ordenes');
        cy.wait('@getOrders');

        cy.contains('button', 'Ver detalle').first().click();
        cy.url().should('include', `/profile/ordenes/${MOCK_ORDER_PENDING_ID}`);
        cy.contains('h3', `Pedido #${MOCK_ORDER_PENDING_ID}`).should('be.visible');

        cy.contains('button', 'Cancelar pedido').click();
        cy.wait('@cancelOrder');
        cy.contains('Cancelada').should('exist');
    });

    it('sube comprobante en pedido por transferencia', () => {
        cy.visit(`/profile/ordenes/${MOCK_ORDER_TRANSFER_ID}`);
        cy.wait('@getOrderById');

        cy.contains('Pago por transferencia bancaria').should('be.visible');
        cy.get(`#comprobante-${MOCK_ORDER_TRANSFER_ID}`).selectFile(
            {
                contents: Cypress.Buffer.from('%PDF-1.4 mock'),
                fileName: 'comprobante.pdf',
                mimeType: 'application/pdf',
            },
            { force: true }
        );
        cy.contains('button', 'Enviar comprobante').click();
        cy.contains('Comprobante guardado').should('be.visible');
    });
});
