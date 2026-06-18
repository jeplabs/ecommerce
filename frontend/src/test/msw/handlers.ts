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
    mockUserProfile,
} from './fixtures/auth';
import { mockEmptyCart } from './fixtures/cart';
import { mockCategories } from './fixtures/categories';
import { mockOrdersPage } from './fixtures/orders';
import { mockProduct, mockProductsPage } from './fixtures/products';

export { resetDynamicAuthUsers };

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

    http.get(`${API_BASE}/api/productos`, () => {
        return HttpResponse.json(mockProductsPage());
    }),

    http.get(`${API_BASE}/api/productos/slug/:slug`, ({ params }) => {
        const slug = String(params.slug);
        if (slug === mockProduct.slug) {
            return HttpResponse.json(mockProduct);
        }
        return HttpResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }),

    http.get(`${API_BASE}/api/usuarios/perfil`, () => {
        return HttpResponse.json(mockUserProfile);
    }),

    http.get(`${API_BASE}/api/direcciones`, () => {
        return HttpResponse.json([]);
    }),

    http.get(`${API_BASE}/api/ordenes`, () => {
        return HttpResponse.json(mockOrdersPage());
    }),

    http.get(`${API_BASE}/api/carrito`, () => {
        return HttpResponse.json(mockEmptyCart);
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
