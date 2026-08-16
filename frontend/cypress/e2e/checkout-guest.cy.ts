import { mockProduct } from '../../src/test/msw/fixtures/products';

describe('Checkout invitado', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
    });

    it('redirige a login al agregar producto sin sesión', () => {
        cy.visit('/catalogo');
        cy.wait('@getProducts');
        cy.contains(mockProduct.nombre).should('be.visible');

        cy.get(`button[aria-label="Agregar ${mockProduct.nombre} al carrito"]`)
            .scrollIntoView()
            .click({ force: true });

        cy.url().should('include', '/login');
        cy.contains('h1', 'Iniciar sesión').should('be.visible');
    });

    it('redirige a login al visitar el carrito sin sesión', () => {
        cy.visit('/cart');
        cy.get('body').should('contain.text', 'Iniciar sesión');
        cy.location('pathname').should('eq', '/login');
    });
});
