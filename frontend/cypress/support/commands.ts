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
    getDynamicOrdersAdminPage,
    getDynamicOrdersPage,
    resetDynamicOrders,
    updateDynamicOrderComprobante,
    updateDynamicOrderStatusAdmin,
} from '../../src/test/msw/fixtures/orders-registry';
import {
    getDynamicProfile,
    resetDynamicProfile,
    updateDynamicProfile,
    updateDynamicPassword,
} from '../../src/test/msw/fixtures/profile-registry';
import {
    addDynamicFavorite,
    getDynamicFavorites,
    removeDynamicFavorite,
    resetDynamicFavorites,
} from '../../src/test/msw/fixtures/favorites-registry';
import { mockCategories } from '../../src/test/msw/fixtures/categories';
import { mockCreatedOrder } from '../../src/test/msw/fixtures/orders';
import {
    createDynamicProduct,
    deleteDynamicProduct,
    findDynamicProductAdminById,
    findDynamicProductBySlug,
    mockDynamicAdminProductsPage,
    mockDynamicProductsPage,
    mockDynamicProductsPageForCategory,
    resetDynamicProducts,
    updateDynamicProductStatus,
} from '../../src/test/msw/fixtures/products-registry';
import {
    findDynamicUser,
    getDynamicUsers,
    resetDynamicUsers,
    updateDynamicUserEstado,
    updateDynamicUserRol,
} from '../../src/test/msw/fixtures/users-registry';
import { mockShippingOptions } from '../../src/test/msw/fixtures/shipping';
import type { OrderApi } from '../../src/entities/order/model/schemas/api';

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
        if (url.pathname.includes('/admin') || url.pathname.includes('/slug/')) {
            return;
        }

        const categoriaId = url.searchParams.get('categoriaId');

        if (categoriaId) {
            const id = Number(categoriaId);
            if (Number.isFinite(id)) {
                req.reply(mockDynamicProductsPageForCategory(id));
                return;
            }
        }

        req.reply(mockDynamicProductsPage());
    }).as('getProducts');
    cy.intercept('GET', '**/api/productos/slug/*', (req) => {
        const slug = req.url.split('/slug/')[1]?.split('?')[0];
        const product = slug ? findDynamicProductBySlug(decodeURIComponent(slug)) : undefined;

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
    resetDynamicFavorites();

    cy.intercept('GET', '**/api/favoritos', (req) => {
        req.reply(getDynamicFavorites());
    }).as('getFavorites');
    cy.intercept('POST', '**/api/favoritos/*', (req) => {
        const productId = Number(req.url.split('/').pop());
        try {
            req.reply(addDynamicFavorite(productId));
        } catch {
            req.reply({ statusCode: 404, body: { error: 'Producto no encontrado' } });
        }
    }).as('addFavorite');
    cy.intercept('DELETE', '**/api/favoritos/*', (req) => {
        const productId = Number(req.url.split('/').pop());
        try {
            removeDynamicFavorite(productId);
            req.reply({});
        } catch {
            req.reply({ statusCode: 404, body: { error: 'El producto no está en tus favoritos' } });
        }
    }).as('removeFavorite');

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
    cy.intercept('GET', '**/api/pagos/webpay/estado/*', (req) => {
        const id = Number(req.url.split('/estado/')[1]?.split('?')[0]);
        const order = findDynamicOrder(id);
        if (!order) {
            req.reply({ statusCode: 404, body: { error: 'Transacción no encontrada' } });
            return;
        }
        const estado =
            order.estado === 'CONFIRMADA'
                ? 'APROBADA'
                : order.estado === 'CANCELADA'
                  ? 'ABORTADA'
                  : 'INICIADA';
        req.reply({ ordenId: id, estado, motivo: null });
    }).as('getWebpayEstado');
    cy.intercept('PATCH', '**/api/ordenes/*/cancelar', (req) => {
        const id = Number(req.url.split('/ordenes/')[1]?.split('/')[0]);
        try {
            req.reply(cancelDynamicOrder(id));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al cancelar';
            req.reply({ statusCode: 400, body: { error: message } });
        }
    }).as('cancelOrder');
    cy.intercept('POST', '**/api/ordenes/*/comprobante', (req) => {
        const id = Number(req.url.split('/ordenes/')[1]?.split('/')[0]);
        try {
            req.reply(
                updateDynamicOrderComprobante(
                    id,
                    'https://cdn.example/comprobante.pdf',
                    'comprobante.pdf',
                    '2026-05-28T15:00:00'
                )
            );
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Error al subir el comprobante';
            req.reply({ statusCode: 404, body: { error: message } });
        }
    }).as('uploadComprobante');
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
    cy.intercept('GET', '**/api/banco', (req) => {
        req.reply([
            {
                id: 1,
                banco: 'Banco Demo',
                titular: 'JEPLabs',
                tipoCuenta: 'Corriente',
                numeroCuenta: '001-002-003',
                moneda: 'GTQ',
                activo: true,
                ordenViualizacion: 1,
            },
        ]);
    }).as('getBankAccounts');
});

Cypress.Commands.add('stubAdminApi', () => {
    resetDynamicProducts();
    resetDynamicUsers();

    cy.intercept('GET', '**/api/auth/usuarios', (req) => {
        req.reply(getDynamicUsers());
    }).as('getAdminUsers');
    cy.intercept('GET', '**/api/auth/usuarios/*', (req) => {
        const id = Number(req.url.split('/usuarios/')[1]?.split('?')[0]);
        const user = findDynamicUser(id);
        if (user) {
            req.reply(user);
            return;
        }
        req.reply({ statusCode: 404, body: { error: 'Usuario no encontrado' } });
    }).as('getAdminUserById');
    cy.intercept('PATCH', '**/api/auth/usuarios/*/estado', (req) => {
        const id = Number(req.url.split('/usuarios/')[1]?.split('/')[0]);
        const body = req.body as { activo?: boolean };
        try {
            req.reply(updateDynamicUserEstado(id, body.activo ?? false));
        } catch {
            req.reply({ statusCode: 404, body: { error: 'Usuario no encontrado' } });
        }
    }).as('updateUserEstado');
    cy.intercept('PATCH', '**/api/auth/usuarios/*/rol', (req) => {
        const id = Number(req.url.split('/usuarios/')[1]?.split('/')[0]);
        const body = req.body as { rol?: 'ROLE_CUSTOMER' | 'ROLE_ADMIN' };
        try {
            req.reply(updateDynamicUserRol(id, body.rol ?? 'ROLE_CUSTOMER'));
        } catch {
            req.reply({ statusCode: 404, body: { error: 'Usuario no encontrado' } });
        }
    }).as('updateUserRol');

    cy.intercept('GET', '**/api/productos/admin?*', (req) => {
        const url = new URL(req.url);
        const estado = url.searchParams.get('estado') ?? 'DISPONIBLE';
        req.reply(
            mockDynamicAdminProductsPage(
                estado as 'DISPONIBLE' | 'SIN_STOCK' | 'OCULTO' | 'DESCONTINUADO'
            )
        );
    }).as('getAdminProducts');
    cy.intercept('GET', '**/api/productos/admin/*', (req) => {
        const id = Number(req.url.split('/admin/')[1]?.split('?')[0]);
        const product = findDynamicProductAdminById(id);
        if (product) {
            req.reply(product);
            return;
        }
        req.reply({ statusCode: 404, body: { error: 'Producto no encontrado' } });
    }).as('getAdminProductById');
    cy.intercept('POST', '**/api/productos', (req) => {
        const body = req.body as Parameters<typeof createDynamicProduct>[0];
        req.reply({ statusCode: 201, body: createDynamicProduct(body) });
    }).as('createProduct');
    cy.intercept('PATCH', '**/api/productos/*/estado', (req) => {
        const id = Number(req.url.split('/productos/')[1]?.split('/')[0]);
        const body = req.body as { estado?: string };
        try {
            req.reply(
                updateDynamicProductStatus(
                    id,
                    (body.estado ?? 'DISPONIBLE') as
                        | 'DISPONIBLE'
                        | 'SIN_STOCK'
                        | 'OCULTO'
                        | 'DESCONTINUADO'
                )
            );
        } catch {
            req.reply({ statusCode: 404, body: { error: 'Producto no encontrado' } });
        }
    }).as('updateProductStatus');
    cy.intercept('DELETE', '**/api/productos/*', (req) => {
        const id = Number(req.url.split('/productos/')[1]?.split('?')[0]);
        try {
            deleteDynamicProduct(id);
            req.reply({ statusCode: 204 });
        } catch {
            req.reply({ statusCode: 404, body: { error: 'Producto no encontrado' } });
        }
    }).as('deleteProduct');

    cy.intercept('GET', '**/api/ordenes/admin?*', (req) => {
        const url = new URL(req.url);
        const page = Number(url.searchParams.get('page') ?? 0);
        const size = Number(url.searchParams.get('size') ?? 10);
        const estado = url.searchParams.get('estado') as
            | 'PENDIENTE'
            | 'CONFIRMADA'
            | 'EN_PROCESO'
            | 'ENVIADA'
            | 'ENTREGADA'
            | 'CANCELADA'
            | null;
        req.reply(getDynamicOrdersAdminPage(page, size, estado || undefined));
    }).as('getAdminOrders');
    cy.intercept('GET', '**/api/ordenes/admin/*', (req) => {
        const id = Number(req.url.split('/admin/')[1]?.split('?')[0]);
        const order = findDynamicOrder(id);
        if (order) {
            req.reply(order);
            return;
        }
        req.reply({ statusCode: 404, body: { error: 'Orden no encontrada' } });
    }).as('getAdminOrderById');
    cy.intercept('PATCH', '**/api/ordenes/admin/*/estado', (req) => {
        const id = Number(req.url.split('/ordenes/')[1]?.split('/')[0]);
        const body = req.body as { estado?: string };
        try {
            req.reply(
                updateDynamicOrderStatusAdmin(
                    id,
                    (body.estado ?? 'PENDIENTE') as
                        | 'PENDIENTE'
                        | 'CONFIRMADA'
                        | 'EN_PROCESO'
                        | 'ENVIADA'
                        | 'ENTREGADA'
                        | 'CANCELADA'
                )
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al actualizar';
            req.reply({ statusCode: 400, body: { error: message } });
        }
    }).as('updateAdminOrderStatus');
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
    cy.url().should('include', '/profile');
});

Cypress.Commands.add('loginAsAdmin', () => {
    cy.visit('/login');
    cy.fillLoginForm(MOCK_ADMIN_EMAIL, MOCK_LOGIN_PASSWORD);
    cy.submitLoginForm();
    cy.wait('@login');
    cy.url().should('include', '/admin');
});

Cypress.Commands.add('addProductToCart', (productName: string) => {
    cy.get(`button[aria-label="Agregar ${productName} al carrito"]`).scrollIntoView().click();
    cy.wait('@addCartItem');
});

/** Agrega un ítem al carrito dinámico directamente (mismo registro que usan los intercepts). */
Cypress.Commands.add('addCartItemDirect', (productId: number, cantidad = 1) => {
    addDynamicCartItem(productId, cantidad);
});

/** Cambia el estado de una orden dinámica directamente (mismo registro que usan los intercepts). */
Cypress.Commands.add('setOrderEstado', (id: number, estado: OrderApi['estado']) => {
    updateDynamicOrderStatusAdmin(id, estado);
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
            addCartItemDirect(productId: number, cantidad?: number): Chainable<void>;
            setOrderEstado(id: number, estado: OrderApi['estado']): Chainable<void>;
        }
    }
}

export {};
