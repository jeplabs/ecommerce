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
    mockUsersList,
} from '../../src/test/msw/fixtures/auth';
import {
    addDynamicCartItem,
    clearDynamicCart,
    getDynamicCart,
    removeDynamicCartItem,
    resetDynamicCart,
    updateDynamicCartItem,
} from '../../src/test/msw/fixtures/cart-registry';
import {
    createDynamicAddress,
    deleteDynamicAddress,
    getDynamicAddresses,
    resetDynamicAddresses,
    setDynamicPrincipal,
    updateDynamicAddress,
} from '../../src/test/msw/fixtures/address-registry';
import {
    addDynamicOrder,
    cancelDynamicOrder,
    findDynamicOrder,
    getDynamicOrdersPage,
    resetDynamicOrders,
} from '../../src/test/msw/fixtures/orders-registry';
import {
    getDynamicProfile,
    resetDynamicProfile,
    updateDynamicProfile,
    updateDynamicPassword,
} from '../../src/test/msw/fixtures/profile-registry';
import { mockCategories } from '../../src/test/msw/fixtures/categories';
import { mockCreatedOrder } from '../../src/test/msw/fixtures/orders';
import {
    findMockProductBySlug,
    mockProductsPage,
    mockProductsPageForCategory,
} from '../../src/test/msw/fixtures/products';
import { mockShippingOptions } from '../../src/test/msw/fixtures/shipping';

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
    resetDynamicCart();
    resetDynamicAddresses();
    resetDynamicOrders();
    resetDynamicProfile();

    cy.intercept('GET', '**/api/usuarios/perfil', (req) => {
        req.reply(getDynamicProfile());
    }).as('getProfile');
    cy.intercept('PATCH', '**/api/usuarios/perfil', (req) => {
        const body = req.body as { nombre?: string; apellido?: string; pais?: string };
        req.reply(
            updateDynamicProfile({
                nombre: body.nombre ?? '',
                apellido: body.apellido ?? '',
                pais: body.pais ?? '',
            })
        );
    }).as('updateProfile');
    cy.intercept('PATCH', '**/api/usuarios/perfil/password', (req) => {
        const body = req.body as { passwordActual?: string; password?: string };
        try {
            req.reply(updateDynamicPassword(body.passwordActual ?? '', body.password ?? ''));
        } catch {
            req.reply({ statusCode: 400, body: { error: 'Contraseña actual incorrecta' } });
        }
    }).as('updatePassword');
    cy.intercept('GET', '**/api/direcciones', (req) => {
        req.reply(getDynamicAddresses());
    }).as('getAddresses');
    cy.intercept('POST', '**/api/direcciones', (req) => {
        req.reply({ statusCode: 201, body: createDynamicAddress(req.body) });
    }).as('createAddress');
    cy.intercept('PATCH', '**/api/direcciones/*/principal', (req) => {
        const id = Number(req.url.split('/direcciones/')[1]?.split('/')[0]);
        try {
            req.reply(setDynamicPrincipal(id));
        } catch {
            req.reply({ statusCode: 404, body: { error: 'Dirección no encontrada' } });
        }
    }).as('setPrincipalAddress');
    cy.intercept('PATCH', '**/api/direcciones/*', (req) => {
        const id = Number(req.url.split('/direcciones/')[1]?.split('/')[0]?.split('?')[0]);
        try {
            req.reply(updateDynamicAddress(id, req.body));
        } catch {
            req.reply({ statusCode: 404, body: { error: 'Dirección no encontrada' } });
        }
    }).as('updateAddress');
    cy.intercept('DELETE', '**/api/direcciones/*', (req) => {
        const id = Number(req.url.split('/direcciones/')[1]?.split('?')[0]);
        try {
            deleteDynamicAddress(id);
            req.reply({ statusCode: 204 });
        } catch {
            req.reply({ statusCode: 404, body: { error: 'Dirección no encontrada' } });
        }
    }).as('deleteAddress');
    cy.intercept('GET', '**/api/ordenes?*', (req) => {
        const url = new URL(req.url);
        const page = Number(url.searchParams.get('page') ?? 0);
        req.reply(getDynamicOrdersPage(page));
    }).as('getOrders');
    cy.intercept('GET', '**/api/ordenes/*', (req) => {
        const id = Number(req.url.split('/ordenes/')[1]?.split('?')[0]);
        const order = findDynamicOrder(id);
        if (order) {
            req.reply(order);
            return;
        }
        req.reply({ statusCode: 404, body: { error: 'Orden no encontrada' } });
    }).as('getOrderById');
    cy.intercept('PATCH', '**/api/ordenes/*/cancelar', (req) => {
        const id = Number(req.url.split('/ordenes/')[1]?.split('/')[0]);
        try {
            req.reply(cancelDynamicOrder(id));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al cancelar';
            req.reply({ statusCode: 400, body: { error: message } });
        }
    }).as('cancelOrder');
    cy.intercept('GET', '**/api/carrito', (req) => {
        req.reply(getDynamicCart());
    }).as('getCart');
    cy.intercept('POST', '**/api/carrito/items', (req) => {
        const body = req.body as { productoId?: number; cantidad?: number };

        if (!body.productoId || !body.cantidad) {
            req.reply({ statusCode: 400, body: { error: 'Datos incompletos' } });
            return;
        }

        try {
            req.reply({
                statusCode: 201,
                body: addDynamicCartItem(body.productoId, body.cantidad),
            });
        } catch {
            req.reply({ statusCode: 404, body: { error: 'Producto no encontrado' } });
        }
    }).as('addCartItem');
    cy.intercept('PATCH', '**/api/carrito/items/*', (req) => {
        const itemId = Number(req.url.split('/items/')[1]?.split('?')[0]);
        const body = req.body as { cantidad?: number };

        if (!Number.isFinite(itemId) || body.cantidad == null) {
            req.reply({ statusCode: 400, body: { error: 'Datos incompletos' } });
            return;
        }

        try {
            req.reply(updateDynamicCartItem(itemId, body.cantidad));
        } catch {
            req.reply({ statusCode: 404, body: { error: 'Ítem no encontrado' } });
        }
    }).as('updateCartItem');
    cy.intercept('DELETE', '**/api/carrito/items/*', (req) => {
        const itemId = Number(req.url.split('/items/')[1]?.split('?')[0]);

        if (!Number.isFinite(itemId)) {
            req.reply({ statusCode: 400, body: { error: 'Datos incompletos' } });
            return;
        }

        req.reply(removeDynamicCartItem(itemId));
    }).as('removeCartItem');
    cy.intercept('DELETE', '**/api/carrito', (req) => {
        req.reply(clearDynamicCart());
    }).as('clearCart');
    cy.intercept('GET', '**/api/envio/opciones*', (req) => {
        const url = new URL(req.url);
        const subtotal = Number(url.searchParams.get('subtotal') ?? 0);
        req.reply(mockShippingOptions(subtotal));
    }).as('getShippingOptions');
    cy.intercept('POST', '**/api/ordenes', (req) => {
        const body = req.body as {
            direccionId?: number;
            servicioEnvioId?: number;
            notas?: string | null;
        };

        if (!body.direccionId || !body.servicioEnvioId) {
            req.reply({ statusCode: 400, body: { error: 'Datos incompletos' } });
            return;
        }

        const cart = getDynamicCart();
        if (cart.items.length === 0) {
            req.reply({ statusCode: 400, body: { error: 'Carrito vacío' } });
            return;
        }

        const orden = mockCreatedOrder({
            direccionId: body.direccionId,
            servicioEnvioId: body.servicioEnvioId,
            cart,
            notas: body.notas ?? null,
        });

        clearDynamicCart();
        addDynamicOrder(orden);
        req.reply({ statusCode: 201, body: orden });
    }).as('createOrder');
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

Cypress.Commands.add('addProductToCart', (productName: string) => {
    cy.get(`button[aria-label="Agregar ${productName} al carrito"]`).scrollIntoView().click();
    cy.wait('@addCartItem');
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
            addProductToCart(productName: string): Chainable<void>;
        }
    }
}

export {};
