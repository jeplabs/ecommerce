import { mockProduct } from '../../src/test/msw/fixtures/products';

describe('Checkout invitado', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
        cy.stubAuthApi();
    });

    it('redirige a login al agregar producto sin sesión', () => {
        cy.visit('/catalogo');
        cy.wait('@getProducts');
        cy.contains(mockProduct.nombre).should('be.visible');

        cy.get(`button[aria-label="Agregar ${mockProduct.nombre} al carrito"]`)
            .should('be.visible')
            .click();

            cy.get('body').should('contain.text', 'Iniciar sesión');
            cy.url().should('include', '/login');
    });

    it('redirige a login al visitar el carrito sin sesión', () => {
        cy.visit('/cart');
        cy.get('body').should('contain.text', 'Iniciar sesión');
        cy.location('pathname').should('eq', '/login');
    });
});
