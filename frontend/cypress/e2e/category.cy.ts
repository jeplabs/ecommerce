describe('Categoría', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
    });

    it('muestra productos de la subcategoría Audio', () => {
        cy.visit('/categoria/electronica/audio');
        cy.wait('@getCategories');
        cy.wait('@getProducts');
        cy.contains('h1', 'Audio').should('be.visible');
        cy.contains('Auriculares Alpha').should('be.visible');
        cy.contains('Parlante Zebra').should('be.visible');
        cy.contains('Producto de prueba').should('not.exist');
    });
});
