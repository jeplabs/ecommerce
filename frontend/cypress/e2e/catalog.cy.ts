describe('Catálogo', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
    });

    it('muestra productos del catálogo', () => {
        cy.visit('/catalogo');
        cy.wait('@getProducts');
        cy.contains('h1', 'Catalogo').should('be.visible');
        cy.contains('Producto de prueba').should('be.visible');
        cy.contains('Producto agotado').should('be.visible');
        cy.contains('Agotado').should('exist');
    });
});
