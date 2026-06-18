describe('Perfil de cliente', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
        cy.stubAuthApi();
        cy.stubAuthenticatedApi();
        cy.loginAsCustomer();
    });

    it('navega por las pestañas del perfil', () => {
        cy.visit('/profile');
        cy.wait('@getProfile');

        cy.contains('h1', 'Mi cuenta').should('be.visible');
        cy.get('[role="tablist"][aria-label="Secciones del perfil"]').should('exist');

        cy.contains('[role="tab"]', 'Mis datos').should('have.attr', 'aria-selected', 'true');
        cy.get('[aria-label="Datos personales"]').should('be.visible');

        cy.contains('[role="tab"]', 'Direcciones').click();
        cy.url().should('include', '/profile/direcciones');
        cy.wait('@getAddresses');
        cy.contains('h2', 'Mis direcciones').should('be.visible');
        cy.contains('Casa').should('be.visible');

        cy.contains('[role="tab"]', 'Mis pedidos').click();
        cy.url().should('include', '/profile/ordenes');
        cy.wait('@getOrders');
        cy.contains('h2', 'Mis pedidos').should('be.visible');

        cy.contains('[role="tab"]', 'Favoritos').click();
        cy.url().should('include', '/profile/favoritos');
        cy.contains('h2', 'Mis favoritos').should('be.visible');
    });
});
