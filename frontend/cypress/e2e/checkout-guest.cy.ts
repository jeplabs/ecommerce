import { mockProduct } from '../../src/test/msw/fixtures/products';

describe('Checkout invitado', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
    });

    it('redirige a login al agregar producto sin sesión', () => {
        cy.visit('/catalogo');
        cy.wait('@getProducts');

        cy.get(`button[aria-label="Agregar ${mockProduct.nombre} al carrito"]`)
            .scrollIntoView()
            .click();

        cy.url().should('include', '/login');
    });

    it('redirige a login al visitar el carrito sin sesión', () => {
        cy.visit('/cart');
        cy.url().should('include', '/login');
    });
});
