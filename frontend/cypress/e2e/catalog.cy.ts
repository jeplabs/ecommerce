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
        cy.contains('Auriculares Alpha').should('be.visible');
        cy.contains('Agotado').should('exist');
    });

    it('filtra por búsqueda en la URL', () => {
        cy.visit('/catalogo?search=Alpha');
        cy.wait('@getProducts');
        cy.contains('Auriculares Alpha').should('be.visible');
        cy.contains('Producto de prueba').should('not.exist');
        cy.contains('h2', 'Productos (1)').should('be.visible');
    });

    it('ordena por precio descendente desde la URL', () => {
        cy.visit('/catalogo?sort=price-desc');
        cy.wait('@getProducts');
        cy.get('[aria-label="Catálogo de productos"] h3').first().should('contain', 'Parlante Zebra');
    });

    it('filtra por precio máximo desde la URL', () => {
        cy.visit('/catalogo?precioMax=55');
        cy.wait('@getProducts');
        cy.contains('Auriculares Alpha').should('be.visible');
        cy.contains('Parlante Zebra').should('not.exist');
        cy.contains('h2', 'Productos (1)').should('be.visible');
    });
});
