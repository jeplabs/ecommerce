import { mockAuthTokenResponse, mockUserProfile } from '../../src/test/msw/fixtures/auth';
import { mockEmptyCart } from '../../src/test/msw/fixtures/cart';
import { mockCategories } from '../../src/test/msw/fixtures/categories';
import { mockOrdersPage } from '../../src/test/msw/fixtures/orders';
import { mockProduct, mockProductsPage } from '../../src/test/msw/fixtures/products';

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

Cypress.Commands.add('stubAuthApi', () => {
    cy.intercept('POST', '**/api/auth/login', (req) => {
        const { email, password } = req.body as { email?: string; password?: string };

        if (email === mockAuthTokenResponse.email && password === 'Password1!') {
            req.reply({ statusCode: 200, body: mockAuthTokenResponse });
            return;
        }

        req.reply({ statusCode: 401, body: { error: 'Credenciales inválidas' } });
    }).as('login');
});

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            stubShopApi(): Chainable<void>;
            stubAuthApi(): Chainable<void>;
            stubAuthenticatedApi(): Chainable<void>;
        }
    }
}

export {};
