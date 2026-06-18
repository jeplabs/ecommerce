import { mockProduct } from '../../src/test/msw/fixtures/products';

describe('Carrito', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
        cy.stubAuthApi();
        cy.stubAuthenticatedApi();
        cy.loginAsCustomer();
    });

    it('agrega producto, cambia cantidad y lo elimina', () => {
        cy.visit('/catalogo');
        cy.wait('@getProducts');
        cy.addProductToCart(mockProduct.nombre);

        cy.visit('/cart');
        cy.wait('@getCart');
        cy.contains('h1', 'Mi Carrito').should('be.visible');

        cy.get('[aria-label="Productos en el carrito"]').within(() => {
            cy.contains(mockProduct.nombre).should('be.visible');
            cy.get('[aria-label="Aumentar cantidad"]').click();
        });

        cy.wait('@updateCartItem');
        cy.get('[aria-label="Productos en el carrito"] [aria-live="polite"]').should('have.text', '2');

        cy.get('[aria-label="Productos en el carrito"]').contains('button', 'Eliminar').click();
        cy.wait('@removeCartItem');
        cy.contains('Tu carrito está vacío').should('exist');
    });
});
