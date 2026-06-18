import { mockUserProfile } from '../../src/test/msw/fixtures/auth';

describe('Admin usuarios', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
        cy.stubAuthApi();
        cy.stubAuthenticatedApi();
        cy.stubAdminApi();
        cy.loginAsAdmin();
    });

    it('lista usuarios y edita el rol de un cliente', () => {
        cy.visit('/admin/users');
        cy.wait('@getAdminUsers');

        cy.contains('h1', 'Gestión de usuarios').should('be.visible');
        cy.contains(mockUserProfile.email).should('be.visible');
        cy.contains('Cliente').should('be.visible');

        cy.contains('button', 'Editar').first().click({ force: true });
        cy.url().should('include', `/admin/users/${mockUserProfile.id}/edit`);
        cy.wait('@getAdminUserById');

        cy.contains('h1', 'Editar usuario').should('be.visible');
        cy.get('#user-rol').select('ROLE_ADMIN');
        cy.contains('button', 'Guardar rol').click({ force: true });
        cy.wait('@updateUserRol');

        cy.contains('Administrador').should('be.visible');
    });
});
