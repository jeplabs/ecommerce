import { http, HttpResponse } from 'msw';
import { API_BASE } from './constants';
import {
    isEmailTaken,
    registerDynamicAuthUser,
    resetDynamicAuthUsers,
    tryDynamicLogin,
} from './fixtures/auth-registry';
import {
    MOCK_ADMIN_EMAIL,
    MOCK_LOGIN_EMAIL,
    MOCK_LOGIN_PASSWORD,
    createMockRegisteredUser,
    mockAdminAuthTokenResponse,
    mockAuthTokenResponse,
} from './fixtures/auth';
import {
    addDynamicOrder,
    cancelDynamicOrder,
    findDynamicOrder,
    getDynamicOrdersPage,
    resetDynamicOrders,
} from './fixtures/orders-registry';
import type { AddressApi } from '@/entities/address/model/schemas/api';
import {
    createDynamicAddress,
    deleteDynamicAddress,
    getDynamicAddresses,
    resetDynamicAddresses,
    setDynamicPrincipal,
    updateDynamicAddress,
} from './fixtures/address-registry';
import {
    getDynamicProfile,
    resetDynamicProfile,
    updateDynamicProfile,
    updateDynamicPassword,
} from './fixtures/profile-registry';
import {
    addDynamicCartItem,
    clearDynamicCart,
    getDynamicCart,
    removeDynamicCartItem,
    resetDynamicCart,
    updateDynamicCartItem,
} from './fixtures/cart-registry';
import { mockCategories } from './fixtures/categories';
import { mockCreatedOrder, resetMockOrderIds } from './fixtures/orders';
import {
    findMockProductBySlug,
    mockProductsPage,
    mockProductsPageForCategory,
} from './fixtures/products';
import { mockShippingOptions } from './fixtures/shipping';

export { resetDynamicAuthUsers, resetDynamicCart, resetDynamicAddresses, resetDynamicOrders, resetDynamicProfile };

function resolveLogin(body: { email?: string; password?: string }) {
    if (body.email === MOCK_LOGIN_EMAIL && body.password === MOCK_LOGIN_PASSWORD) {
        return mockAuthTokenResponse;
    }

    if (body.email === MOCK_ADMIN_EMAIL && body.password === MOCK_LOGIN_PASSWORD) {
        return mockAdminAuthTokenResponse;
    }

    if (body.email && body.password) {
        return tryDynamicLogin(body.email, body.password);
    }

    return null;
}

export const handlers = [
    http.get(`${API_BASE}/api/categorias`, () => {
        return HttpResponse.json(mockCategories);
    }),

    http.get(`${API_BASE}/api/productos`, ({ request }) => {
        const url = new URL(request.url);
        const categoriaId = url.searchParams.get('categoriaId');

        if (categoriaId) {
            const id = Number(categoriaId);
            if (Number.isFinite(id)) {
                return HttpResponse.json(mockProductsPageForCategory(id));
            }
        }

        return HttpResponse.json(mockProductsPage());
    }),

    http.get(`${API_BASE}/api/productos/slug/:slug`, ({ params }) => {
        const slug = String(params.slug);
        const product = findMockProductBySlug(slug);

        if (product) {
            return HttpResponse.json(product);
        }

        return HttpResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }),

    http.get(`${API_BASE}/api/usuarios/perfil`, () => {
        return HttpResponse.json(getDynamicProfile());
    }),

    http.patch(`${API_BASE}/api/usuarios/perfil`, async ({ request }) => {
        const body = (await request.json()) as {
            nombre?: string;
            apellido?: string;
            pais?: string;
        };

        if (!body.nombre || !body.apellido || !body.pais) {
            return HttpResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        return HttpResponse.json(
            updateDynamicProfile({
                nombre: body.nombre,
                apellido: body.apellido,
                pais: body.pais,
            })
        );
    }),

    http.patch(`${API_BASE}/api/usuarios/perfil/password`, async ({ request }) => {
        const body = (await request.json()) as {
            passwordActual?: string;
            password?: string;
        };

        if (!body.passwordActual || !body.password) {
            return HttpResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        try {
            return HttpResponse.json(
                updateDynamicPassword(body.passwordActual, body.password)
            );
        } catch {
            return HttpResponse.json(
                { error: 'Contraseña actual incorrecta' },
                { status: 400 }
            );
        }
    }),

    http.get(`${API_BASE}/api/direcciones`, () => {
        return HttpResponse.json(getDynamicAddresses());
    }),

    http.post(`${API_BASE}/api/direcciones`, async ({ request }) => {
        const body = (await request.json()) as Omit<AddressApi, 'id'>;

        try {
            return HttpResponse.json(createDynamicAddress(body), { status: 201 });
        } catch {
            return HttpResponse.json({ error: 'Error al crear dirección' }, { status: 400 });
        }
    }),

    http.patch(`${API_BASE}/api/direcciones/:id/principal`, ({ params }) => {
        const id = Number(params.id);

        try {
            return HttpResponse.json(setDynamicPrincipal(id));
        } catch {
            return HttpResponse.json({ error: 'Dirección no encontrada' }, { status: 404 });
        }
    }),

    http.patch(`${API_BASE}/api/direcciones/:id`, async ({ params, request }) => {
        const id = Number(params.id);
        const body = (await request.json()) as Partial<Omit<AddressApi, 'id'>>;

        try {
            return HttpResponse.json(updateDynamicAddress(id, body));
        } catch {
            return HttpResponse.json({ error: 'Dirección no encontrada' }, { status: 404 });
        }
    }),

    http.delete(`${API_BASE}/api/direcciones/:id`, ({ params }) => {
        const id = Number(params.id);

        try {
            deleteDynamicAddress(id);
            return new HttpResponse(null, { status: 204 });
        } catch {
            return HttpResponse.json({ error: 'Dirección no encontrada' }, { status: 404 });
        }
    }),

    http.get(`${API_BASE}/api/ordenes`, ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') ?? 0);

        return HttpResponse.json(getDynamicOrdersPage(page));
    }),

    http.get(`${API_BASE}/api/ordenes/:id`, ({ params }) => {
        const id = Number(params.id);
        const order = findDynamicOrder(id);

        if (order) {
            return HttpResponse.json(order);
        }

        return HttpResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }),

    http.patch(`${API_BASE}/api/ordenes/:id/cancelar`, ({ params }) => {
        const id = Number(params.id);

        try {
            return HttpResponse.json(cancelDynamicOrder(id));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al cancelar';
            const status = message.includes('no encontrada') ? 404 : 400;
            return HttpResponse.json({ error: message }, { status });
        }
    }),

    http.post(`${API_BASE}/api/ordenes`, async ({ request }) => {
        const body = (await request.json()) as {
            direccionId?: number;
            servicioEnvioId?: number;
            notas?: string | null;
        };

        if (!body.direccionId || !body.servicioEnvioId) {
            return HttpResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        const cart = getDynamicCart();
        if (cart.items.length === 0) {
            return HttpResponse.json({ error: 'Carrito vacío' }, { status: 400 });
        }

        const orden = mockCreatedOrder({
            direccionId: body.direccionId,
            servicioEnvioId: body.servicioEnvioId,
            cart,
            notas: body.notas ?? null,
        });

        clearDynamicCart();
        addDynamicOrder(orden);

        return HttpResponse.json(orden, { status: 201 });
    }),

    http.get(`${API_BASE}/api/carrito`, () => {
        return HttpResponse.json(getDynamicCart());
    }),

    http.post(`${API_BASE}/api/carrito/items`, async ({ request }) => {
        const body = (await request.json()) as { productoId?: number; cantidad?: number };

        if (!body.productoId || !body.cantidad) {
            return HttpResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        try {
            return HttpResponse.json(
                addDynamicCartItem(body.productoId, body.cantidad),
                { status: 201 }
            );
        } catch {
            return HttpResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
        }
    }),

    http.patch(`${API_BASE}/api/carrito/items/:itemId`, async ({ params, request }) => {
        const itemId = Number(params.itemId);
        const body = (await request.json()) as { cantidad?: number };

        if (!Number.isFinite(itemId) || body.cantidad == null) {
            return HttpResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        try {
            return HttpResponse.json(updateDynamicCartItem(itemId, body.cantidad));
        } catch {
            return HttpResponse.json({ error: 'Ítem no encontrado' }, { status: 404 });
        }
    }),

    http.delete(`${API_BASE}/api/carrito/items/:itemId`, ({ params }) => {
        const itemId = Number(params.itemId);

        if (!Number.isFinite(itemId)) {
            return HttpResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        return HttpResponse.json(removeDynamicCartItem(itemId));
    }),

    http.delete(`${API_BASE}/api/carrito`, () => {
        return HttpResponse.json(clearDynamicCart());
    }),

    http.get(`${API_BASE}/api/envio/opciones`, ({ request }) => {
        const url = new URL(request.url);
        const subtotal = Number(url.searchParams.get('subtotal') ?? 0);

        return HttpResponse.json(mockShippingOptions(subtotal));
    }),

    http.post(`${API_BASE}/api/auth/register`, async ({ request }) => {
        const body = (await request.json()) as {
            nombre?: string;
            apellido?: string;
            pais?: string;
            email?: string;
            password?: string;
        };

        if (!body.email || !body.nombre || !body.apellido || !body.pais || !body.password) {
            return HttpResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        if (isEmailTaken(body.email)) {
            return HttpResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
        }

        const user = createMockRegisteredUser({
            nombre: body.nombre,
            apellido: body.apellido,
            pais: body.pais,
            email: body.email,
        });

        registerDynamicAuthUser(body.email, body.password, user);

        return HttpResponse.json(user);
    }),

    http.post(`${API_BASE}/api/auth/login`, async ({ request }) => {
        const body = (await request.json()) as { email?: string; password?: string };
        const token = resolveLogin(body);

        if (token) {
            return HttpResponse.json(token);
        }

        return HttpResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }),
];
