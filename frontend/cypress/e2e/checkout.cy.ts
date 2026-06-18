import { mockProduct } from '../../src/test/msw/fixtures/products';

describe('Checkout', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
        cy.stubAuthApi();
        cy.stubAuthenticatedApi();
        cy.loginAsCustomer();
    });

    it('completa pedido con transferencia bancaria', () => {
        cy.visit('/catalogo');
        cy.wait('@getProducts');
        cy.addProductToCart(mockProduct.nombre);

        cy.visit('/cart');
        cy.wait('@getCart');
        cy.contains(mockProduct.nombre).should('be.visible');
        cy.contains('button', 'Proceder al pago').click();

        cy.url().should('include', '/checkout');
        cy.wait('@getAddresses');
        cy.wait('@getShippingOptions');

        cy.contains('h1', 'Checkout').should('be.visible');
        cy.contains('button', 'Continuar al pago').should('not.be.disabled').click();

        cy.contains('button', 'Transferencia bancaria').click();
        cy.contains('button', 'Confirmar pedido').should('not.be.disabled').click();

        cy.wait('@createOrder');
        cy.url().should('include', '/checkout/success');
        cy.contains('h1', 'Pedido registrado — pago pendiente').should('be.visible');
    });
});
