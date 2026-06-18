import {
    MOCK_ADMIN_EMAIL,
    MOCK_LOGIN_EMAIL,
    MOCK_LOGIN_PASSWORD,
    createMockRegisteredUser,
    isRegisteredEmail,
    mockAdminAuthTokenResponse,
    mockAuthTokenResponse,
    mockUserProfile,
    mockUsersList,
} from '../../src/test/msw/fixtures/auth';
import { mockEmptyCart } from '../../src/test/msw/fixtures/cart';
import { mockCategories } from '../../src/test/msw/fixtures/categories';
import { mockOrdersPage } from '../../src/test/msw/fixtures/orders';
import { mockProduct, mockProductsPage } from '../../src/test/msw/fixtures/products';

export type RegisterFormData = {
    nombre: string;
    apellido: string;
    pais: string;
    email: string;
    password: string;
    confirmarPassword: string;
};

/** Intercepta las APIs públicas usadas por la tienda (mismos datos que MSW en Vitest). */
Cypress.Commands.add('stubShopApi', () => {
    cy.intercept('GET', '**/api/categorias', mockCategories).as('getCategories');
    cy.intercept('GET', '**/api/productos*', mockProductsPage()).as('getProducts');
    cy.intercept('GET', `**/api/productos/slug/${mockProduct.slug}`, mockProduct).as(
        'getProductBySlug'
    );
});

Cypress.Commands.add('stubAuthenticatedApi', () => {
    cy.intercept('GET', '**/api/usuarios/perfil', mockUserProfile).as('getProfile');
    cy.intercept('GET', '**/api/direcciones', []).as('getAddresses');
    cy.intercept('GET', '**/api/ordenes*', mockOrdersPage()).as('getOrders');
    cy.intercept('GET', '**/api/carrito', mockEmptyCart).as('getCart');
});

Cypress.Commands.add('stubAdminApi', () => {
    cy.intercept('GET', '**/api/auth/usuarios', mockUsersList).as('getAdminUsers');
});

Cypress.Commands.add('stubAuthApi', () => {
    cy.intercept('POST', '**/api/auth/register', (req) => {
        const body = req.body as RegisterFormData;

        if (isRegisteredEmail(body.email)) {
            req.reply({ statusCode: 409, body: { error: 'El email ya está registrado' } });
            return;
        }

        req.reply({
            statusCode: 201,
            body: createMockRegisteredUser(body),
        });
    }).as('register');

    cy.intercept('POST', '**/api/auth/login', (req) => {
        const { email, password } = req.body as { email?: string; password?: string };

        if (email === MOCK_LOGIN_EMAIL && password === MOCK_LOGIN_PASSWORD) {
            req.reply({ statusCode: 200, body: mockAuthTokenResponse });
            return;
        }

        if (email === MOCK_ADMIN_EMAIL && password === MOCK_LOGIN_PASSWORD) {
            req.reply({ statusCode: 200, body: mockAdminAuthTokenResponse });
            return;
        }

        req.reply({ statusCode: 401, body: { error: 'Credenciales inválidas' } });
    }).as('login');
});

Cypress.Commands.add('fillLoginForm', (email: string, password: string) => {
    cy.contains('h1', 'Iniciar sesión').scrollIntoView();
    cy.contains('h1', 'Iniciar sesión')
        .parent()
        .within(() => {
            cy.get('input[name="email"]').clear().type(email, { force: true });
            cy.get('input[name="password"]').clear().type(password, { force: true });
            cy.get('input[name="email"]').should('have.value', email);
            cy.get('input[name="password"]').should('have.value', password);
        });
});

Cypress.Commands.add('submitLoginForm', () => {
    cy.contains('h1', 'Iniciar sesión')
        .parent()
        .find('button[type="submit"]')
        .click({ force: true });
});

Cypress.Commands.add('fillRegisterForm', (data: RegisterFormData) => {
    cy.contains('h1', 'Registrarse').scrollIntoView();
    cy.contains('h1', 'Registrarse')
        .parent()
        .within(() => {
            cy.get('input[name="nombre"]').clear().type(data.nombre, { force: true });
            cy.get('input[name="apellido"]').clear().type(data.apellido, { force: true });
            cy.get('input[name="pais"]').clear().type(data.pais, { force: true });
            cy.get('input[name="email"]').clear().type(data.email, { force: true });
            cy.get('input[name="password"]').clear().type(data.password, { force: true });
            cy.get('input[name="confirmarPassword"]').clear().type(data.confirmarPassword, {
                force: true,
            });
        });
});

Cypress.Commands.add('submitRegisterForm', () => {
    cy.contains('h1', 'Registrarse')
        .parent()
        .find('button[type="submit"]')
        .click({ force: true });
});

Cypress.Commands.add('loginAsCustomer', () => {
    cy.visit('/login');
    cy.fillLoginForm(MOCK_LOGIN_EMAIL, MOCK_LOGIN_PASSWORD);
    cy.submitLoginForm();
    cy.wait('@login');
});

Cypress.Commands.add('loginAsAdmin', () => {
    cy.visit('/login');
    cy.fillLoginForm(MOCK_ADMIN_EMAIL, MOCK_LOGIN_PASSWORD);
    cy.submitLoginForm();
    cy.wait('@login');
});

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            stubShopApi(): Chainable<void>;
            stubAuthApi(): Chainable<void>;
            stubAuthenticatedApi(): Chainable<void>;
            stubAdminApi(): Chainable<void>;
            fillLoginForm(email: string, password: string): Chainable<void>;
            submitLoginForm(): Chainable<void>;
            fillRegisterForm(data: RegisterFormData): Chainable<void>;
            submitRegisterForm(): Chainable<void>;
            loginAsCustomer(): Chainable<void>;
            loginAsAdmin(): Chainable<void>;
        }
    }
}

export {};
