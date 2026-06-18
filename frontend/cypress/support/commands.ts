import {
    isEmailTaken,
    registerDynamicAuthUser,
    resetDynamicAuthUsers,
    tryDynamicLogin,
} from '../../src/test/msw/fixtures/auth-registry';
import {
    MOCK_ADMIN_EMAIL,
    MOCK_LOGIN_EMAIL,
    MOCK_LOGIN_PASSWORD,
    createMockRegisteredUser,
    mockAdminAuthTokenResponse,
    mockAuthTokenResponse,
    mockUserProfile,
    mockUsersList,
} from '../../src/test/msw/fixtures/auth';
import { mockEmptyCart } from '../../src/test/msw/fixtures/cart';
import { mockCategories } from '../../src/test/msw/fixtures/categories';
import { mockOrdersPage } from '../../src/test/msw/fixtures/orders';
import {
    findMockProductBySlug,
    mockProductsPage,
    mockProductsPageForCategory,
} from '../../src/test/msw/fixtures/products';

export type RegisterFormData = {
    nombre: string;
    apellido: string;
    pais: string;
    email: string;
    password: string;
    confirmarPassword: string;
};

function resolveLogin(email: string | undefined, password: string | undefined) {
    if (email === MOCK_LOGIN_EMAIL && password === MOCK_LOGIN_PASSWORD) {
        return mockAuthTokenResponse;
    }

    if (email === MOCK_ADMIN_EMAIL && password === MOCK_LOGIN_PASSWORD) {
        return mockAdminAuthTokenResponse;
    }

    if (email && password) {
        return tryDynamicLogin(email, password);
    }

    return null;
}

/** Intercepta las APIs públicas usadas por la tienda (mismos datos que MSW en Vitest). */
Cypress.Commands.add('stubShopApi', () => {
    cy.intercept('GET', '**/api/categorias', mockCategories).as('getCategories');
    cy.intercept('GET', '**/api/productos*', (req) => {
        const url = new URL(req.url);
        const categoriaId = url.searchParams.get('categoriaId');

        if (categoriaId) {
            const id = Number(categoriaId);
            if (Number.isFinite(id)) {
                req.reply(mockProductsPageForCategory(id));
                return;
            }
        }

        req.reply(mockProductsPage());
    }).as('getProducts');
    cy.intercept('GET', '**/api/productos/slug/*', (req) => {
        const slug = req.url.split('/slug/')[1]?.split('?')[0];
        const product = slug ? findMockProductBySlug(decodeURIComponent(slug)) : undefined;

        if (product) {
            req.reply(product);
            return;
        }

        req.reply({ statusCode: 404, body: { error: 'Producto no encontrado' } });
    }).as('getProductBySlug');
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
    resetDynamicAuthUsers();

    cy.intercept('POST', '**/api/auth/register', (req) => {
        const body = req.body as RegisterFormData;

        if (isEmailTaken(body.email)) {
            req.reply({ statusCode: 409, body: { error: 'El email ya está registrado' } });
            return;
        }

        const user = createMockRegisteredUser(body);
        registerDynamicAuthUser(body.email, body.password, user);

        req.reply({
            statusCode: 201,
            body: user,
        });
    }).as('register');

    cy.intercept('POST', '**/api/auth/login', (req) => {
        const { email, password } = req.body as { email?: string; password?: string };
        const token = resolveLogin(email, password);

        if (token) {
            req.reply({ statusCode: 200, body: token });
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

Cypress.Commands.add('registerCustomer', (data: RegisterFormData) => {
    cy.visit('/register');
    cy.fillRegisterForm(data);
    cy.submitRegisterForm();
    cy.wait('@register');
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
            registerCustomer(data: RegisterFormData): Chainable<void>;
            loginAsCustomer(): Chainable<void>;
            loginAsAdmin(): Chainable<void>;
        }
    }
}

export {};
