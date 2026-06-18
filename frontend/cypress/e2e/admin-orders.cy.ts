import { MOCK_ORDER_PENDING_ID } from '../../src/test/msw/fixtures/orders-registry';

describe('Admin pedidos', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
        cy.stubAuthApi();
        cy.stubAuthenticatedApi();
        cy.stubAdminApi();
        cy.loginAsAdmin();
    });

    it('lista pedidos y confirma uno pendiente', () => {
        cy.visit('/admin/orders');
        cy.wait('@getAdminOrders');

        cy.contains('h1', 'Historial de pedidos').should('be.visible');
        cy.contains(`#${MOCK_ORDER_PENDING_ID}`).should('be.visible');

        cy.get(`#estado-orden-${MOCK_ORDER_PENDING_ID}`).select('CONFIRMADA');
        cy.contains('button', 'Guardar').first().click({ force: true });
        cy.wait('@updateAdminOrderStatus');

        cy.contains('Confirmada').should('be.visible');
    });

    it('filtra pedidos por estado ENVIADA', () => {
        cy.visit('/admin/orders');
        cy.wait('@getAdminOrders');

        cy.get('#filtro-estado-orden').select('ENVIADA');
        cy.wait('@getAdminOrders');

        cy.contains('#503').should('be.visible');
        cy.contains('#501').should('not.exist');
    });
});
