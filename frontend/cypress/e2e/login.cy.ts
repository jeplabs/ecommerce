describe('Login', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
        cy.stubAuthApi();
        cy.stubAuthenticatedApi();
    });

    const fillLoginForm = (email: string, password: string) => {
        cy.contains('h1', 'Iniciar sesión').scrollIntoView();
        cy.contains('h1', 'Iniciar sesión')
            .parent()
            .within(() => {
                cy.get('input[name="email"]').clear().type(email, { force: true });
                cy.get('input[name="password"]').clear().type(password, { force: true });
                cy.get('input[name="email"]').should('have.value', email);
                cy.get('input[name="password"]').should('have.value', password);
            });
    };

    it('inicia sesión y redirige al perfil', () => {
        cy.visit('/login');
        cy.contains('h1', 'Iniciar sesión').should('be.visible');
        fillLoginForm('test@example.com', 'Password1!');
        cy.contains('h1', 'Iniciar sesión')
            .parent()
            .find('button[type="submit"]')
            .click({ force: true });
        cy.wait('@login');
        cy.url().should('include', '/profile');
        cy.contains('h1', 'Mi cuenta').should('be.visible');
    });

    it('muestra error con credenciales inválidas', () => {
        cy.visit('/login');
        fillLoginForm('wrong@example.com', 'bad');
        cy.contains('h1', 'Iniciar sesión')
            .parent()
            .find('button[type="submit"]')
            .click({ force: true });
        cy.wait('@login');
        cy.url().should('include', '/login');
        cy.contains('Credenciales inválidas').should('be.visible');
    });
});
