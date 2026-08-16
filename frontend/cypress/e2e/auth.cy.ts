import {
    MOCK_ADMIN_EMAIL,
    MOCK_LOGIN_EMAIL,
    MOCK_LOGIN_PASSWORD,
} from '../../src/test/msw/fixtures/auth';

describe('Autenticación', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
        cy.stubAuthApi();
        cy.stubAuthenticatedApi();
        cy.stubAdminApi();
    });

    describe('Registro de cliente', () => {
        it('registra un usuario y redirige al login', () => {
            const email = `cliente-${Date.now()}@example.com`;

            cy.registerCustomer({
                nombre: 'María',
                apellido: 'García',
                pais: 'Argentina',
                email,
                password: MOCK_LOGIN_PASSWORD,
                confirmarPassword: MOCK_LOGIN_PASSWORD,
            });
            cy.url().should('include', '/login');
        });

        it('registra un usuario y luego inicia sesión con las mismas credenciales', () => {
            const email = `cliente-${Date.now()}@example.com`;

            cy.registerCustomer({
                nombre: 'Lucía',
                apellido: 'Pérez',
                pais: 'Argentina',
                email,
                password: MOCK_LOGIN_PASSWORD,
                confirmarPassword: MOCK_LOGIN_PASSWORD,
            });
            cy.url().should('include', '/login');
            cy.fillLoginForm(email, MOCK_LOGIN_PASSWORD);
            cy.submitLoginForm();
            cy.wait('@login');
            cy.url().should('include', '/profile');
            cy.contains('h1', 'Mi cuenta').should('be.visible');
        });

        it('muestra error si el email ya está registrado', () => {
            cy.visit('/register');
            cy.fillRegisterForm({
                nombre: 'Test',
                apellido: 'Usuario',
                pais: 'Argentina',
                email: MOCK_LOGIN_EMAIL,
                password: MOCK_LOGIN_PASSWORD,
                confirmarPassword: MOCK_LOGIN_PASSWORD,
            });
            cy.submitRegisterForm();
            cy.wait('@register');
            cy.url().should('include', '/register');
            cy.contains('h1', 'Registrarse')
                .parent()
                .contains('El email ya está registrado')
                .scrollIntoView()
                .should('exist');
        });
    });

    describe('Iniciar sesión', () => {
        it('redirige a login al visitar perfil sin sesión', () => {
            cy.visit('/profile');
            cy.url().should('include', '/login');
            cy.contains('h1', 'Iniciar sesión').should('be.visible');
        });

        it('como cliente redirige al perfil', () => {
            cy.loginAsCustomer();
            cy.url().should('include', '/profile');
            cy.contains('h1', 'Mi cuenta').should('be.visible');
        });

        it('como admin redirige al panel de administración', () => {
            cy.loginAsAdmin();
            cy.url().should('include', '/admin');
            cy.wait('@getAdminUsers');
            cy.contains('h1', /admin/i).should('be.visible');
        });

        it('muestra error con credenciales inválidas', () => {
            cy.visit('/login');
            cy.fillLoginForm('wrong@example.com', 'bad');
            cy.submitLoginForm();
            cy.wait('@login');
            cy.url().should('include', '/login');
            cy.contains('Credenciales inválidas').should('be.visible');
        });
    });

    describe('Cerrar sesión', () => {
        it('como cliente desde el navbar', () => {
            cy.loginAsCustomer();
            cy.url().should('include', '/profile');
            cy.contains('button', 'Cerrar sesión').click();
            cy.contains('button', 'Iniciar sesión').should('be.visible');
            cy.window().its('localStorage.token').should('be.undefined');
        });

        it('como admin desde el panel', () => {
            cy.loginAsAdmin();
            cy.url().should('include', '/admin');
            cy.contains('button', 'Cerrar sesión').click();
            cy.url().should('not.include', '/admin');
            cy.contains('button', 'Iniciar sesión').should('be.visible');
            cy.window().its('localStorage.token').should('be.undefined');
        });
    });
});
