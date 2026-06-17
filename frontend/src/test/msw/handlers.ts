import { http, HttpResponse } from 'msw';
import { API_BASE } from './constants';
import {
    MOCK_LOGIN_EMAIL,
    MOCK_LOGIN_PASSWORD,
    mockAdminAuthTokenResponse,
    mockAuthTokenResponse,
    mockUserProfile,
} from './fixtures/auth';
import { mockEmptyCart } from './fixtures/cart';
import { mockCategories } from './fixtures/categories';
import { mockOrdersPage } from './fixtures/orders';
import { mockProduct, mockProductsPage } from './fixtures/products';

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

    http.post(`${API_BASE}/api/auth/login`, async ({ request }) => {
        const body = (await request.json()) as { email?: string; password?: string };

        if (body.email === MOCK_LOGIN_EMAIL && body.password === MOCK_LOGIN_PASSWORD) {
            return HttpResponse.json(mockAuthTokenResponse);
        }

        if (body.email === 'admin@example.com' && body.password === MOCK_LOGIN_PASSWORD) {
            return HttpResponse.json(mockAdminAuthTokenResponse);
        }

        return HttpResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }),
];
