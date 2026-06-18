import { mockProduct } from '../../src/test/msw/fixtures/products';

describe('Favoritos', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
        cy.stubAuthApi();
        cy.stubAuthenticatedApi();
        cy.loginAsCustomer();
    });

    it('añade desde producto y quita desde el perfil', () => {
        cy.visit(`/producto/${mockProduct.slug}`);
        cy.wait('@getProductBySlug');

        cy.get('[aria-label="Añadir a favoritos"]').click();
        cy.get('[aria-label="Quitar de favoritos"]').should('have.attr', 'aria-pressed', 'true');

        cy.visit('/profile/favoritos');
        cy.contains('h2', 'Mis favoritos').should('be.visible');
        cy.contains(mockProduct.nombre).should('be.visible');

        cy.contains('button', 'Quitar').click();
        cy.contains('Aún no tienes favoritos').should('exist');
    });
});
