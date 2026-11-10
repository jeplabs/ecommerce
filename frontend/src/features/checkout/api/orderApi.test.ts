import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { orderApi, listarCuentasBancarias, listarMetodosPago, subirComprobanteOrder } from './orderApi';
import { ApiError } from '@/shared';
import { mockAddresses } from '@/test/msw/fixtures/addresses';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { addDynamicCartItem } from '@/test/msw/fixtures/cart-registry';
import { mockProduct } from '@/test/msw/fixtures/products';
import { findDynamicOrder, MOCK_ORDER_PENDING_ID } from '@/test/msw/fixtures/orders-registry';
import { API_BASE } from '@/test/msw/constants';
import { server } from '@/test/msw/server';

function seedSession() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
    localStorage.setItem('rol', 'ROLE_CUSTOMER');
}

describe('orderApi', () => {
    it('listarMisOrdenes devuelve la página de órdenes', async () => {
        seedSession();
        const page = await orderApi.listarMisOrdenes();
        expect(page.content.length).toBeGreaterThan(0);
        expect(page.totalElements).toBe(page.content.length);
    });

    it('listarMisOrdenes lanza ApiError con fallback al fallar', async () => {
        seedSession();
        server.use(
            http.get(`${API_BASE}/api/ordenes`, () =>
                HttpResponse.json({ error: 'Fallo' }, { status: 500 })
            )
        );
        await expect(orderApi.listarMisOrdenes()).rejects.toThrow('Fallo');
    });

    it('obtenerOrden devuelve la orden solicitada', async () => {
        seedSession();
        const orden = await orderApi.obtenerOrden(MOCK_ORDER_PENDING_ID);
        expect(orden.id).toBe(MOCK_ORDER_PENDING_ID);
    });

    it('obtenerOrden lanza ApiError con 404 si no existe', async () => {
        seedSession();
        const promise = orderApi.obtenerOrden(99999);
        await expect(promise).rejects.toMatchObject({ status: 404 });
    });

    it('cancelarOrden cambia el estado a CANCELADA', async () => {
        seedSession();
        const orden = await orderApi.cancelarOrden(MOCK_ORDER_PENDING_ID);
        expect(orden.estado).toBe('CANCELADA');
    });

    it('cancelarOrden lanza ApiError si no se puede cancelar', async () => {
        seedSession();
        await expect(orderApi.cancelarOrden(99999)).rejects.toThrow('Orden no encontrada');
    });

    it('crearOrden crea la orden con el método de pago indicado', async () => {
        seedSession();
        addDynamicCartItem(mockProduct.id, 1);

        const orden = await orderApi.crearOrden({
            direccionId: mockAddresses[0]!.id,
            servicioEnvioId: 2,
            formaPagoEnvio: 'EN_LINEA',
            metodoPagoCodigo: 'WEBPAY',
            notas: null,
        });

        expect(orden.id).toBeGreaterThan(0);
        expect(orden.metodoPago).toBe('WEBPAY');
    });

    it('crearOrden lanza ApiError si faltan datos', async () => {
        seedSession();
        addDynamicCartItem(mockProduct.id, 1);

        await expect(
            orderApi.crearOrden({
                direccionId: 0,
                servicioEnvioId: 2,
                formaPagoEnvio: 'EN_LINEA',
                metodoPagoCodigo: 'WEBPAY',
                notas: null,
            })
        ).rejects.toThrow('Datos incompletos');
    });

    it('subirComprobanteOrder lanza ApiError 401 sin token', async () => {
        const promise = subirComprobanteOrder(501, new File(['x'], 'x.pdf'));
        await expect(promise).rejects.toMatchObject({ status: 401, name: 'ApiError' });
    });

    it('subirComprobanteOrder sube el archivo y devuelve la orden', async () => {
        seedSession();
        server.use(
            http.post(`${API_BASE}/api/ordenes/:id/comprobante`, () => {
                return HttpResponse.json(findDynamicOrder(MOCK_ORDER_PENDING_ID));
            })
        );

        const result = await subirComprobanteOrder(
            MOCK_ORDER_PENDING_ID,
            new File(['contenido'], 'comprobante.pdf', { type: 'application/pdf' })
        );

        expect(result.id).toBe(MOCK_ORDER_PENDING_ID);
    });

    it('subirComprobanteOrder lanza ApiError con fallback al fallar', async () => {
        seedSession();
        server.use(
            http.post(`${API_BASE}/api/ordenes/:id/comprobante`, () =>
                HttpResponse.json({ error: 'Fallo' }, { status: 500 })
            )
        );

        await expect(
            subirComprobanteOrder(MOCK_ORDER_PENDING_ID, new File(['x'], 'x.pdf'))
        ).rejects.toThrow('Fallo');
    });

    it('listarOrdenesAdmin devuelve la página y filtra por estado', async () => {
        seedSession();
        const todas = await orderApi.listarOrdenesAdmin();
        expect(todas.content.length).toBeGreaterThan(0);

        const pendientes = await orderApi.listarOrdenesAdmin({ estado: 'PENDIENTE' });
        expect(pendientes.content.every((o) => o.estado === 'PENDIENTE')).toBe(true);
    });

    it('listarOrdenesAdmin lanza ApiError al fallar', async () => {
        seedSession();
        server.use(
            http.get(`${API_BASE}/api/ordenes/admin`, () =>
                HttpResponse.json({ error: 'Fallo' }, { status: 500 })
            )
        );
        await expect(orderApi.listarOrdenesAdmin()).rejects.toThrow('Fallo');
    });

    it('obtenerOrdenAdmin devuelve la orden o lanza 404', async () => {
        seedSession();
        const orden = await orderApi.obtenerOrdenAdmin(MOCK_ORDER_PENDING_ID);
        expect(orden.id).toBe(MOCK_ORDER_PENDING_ID);

        await expect(orderApi.obtenerOrdenAdmin(99999)).rejects.toMatchObject({
            status: 404,
        });
    });

    it('actualizarEstadoOrdenAdmin cambia el estado', async () => {
        seedSession();
        const orden = await orderApi.actualizarEstadoOrdenAdmin(
            MOCK_ORDER_PENDING_ID,
            'CONFIRMADA'
        );
        expect(orden.estado).toBe('CONFIRMADA');
    });

    it('listarCuentasBancarias devuelve las cuentas', async () => {
        seedSession();
        server.use(
            http.get(`${API_BASE}/api/banco`, () =>
                HttpResponse.json([
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
                ])
            )
        );

        const cuentas = await listarCuentasBancarias();
        expect(cuentas[0]?.banco).toBe('Banco Demo');
    });

    it('listarCuentasBancarias lanza ApiError con fallback al fallar', async () => {
        seedSession();
        server.use(
            http.get(`${API_BASE}/api/banco`, () =>
                HttpResponse.json({ error: 'Fallo' }, { status: 500 })
            )
        );

        await expect(listarCuentasBancarias()).rejects.toThrow('Fallo');
    });

    it('listarMetodosPago devuelve los métodos', async () => {
        seedSession();
        server.use(
            http.get(`${API_BASE}/api/pagos/metodos`, () =>
                HttpResponse.json([
                    {
                        id: 1,
                        codigo: 'WEBPAY',
                        nombre: 'Webpay Plus',
                        descripcion: null,
                        activo: true,
                        tipo: 'PASARELA',
                        ordenVisualizacion: 1,
                        configuracion: null,
                    },
                ])
            )
        );

        const metodos = await listarMetodosPago();
        expect(metodos[0]?.codigo).toBe('WEBPAY');
    });

    it('listarMetodosPago lanza ApiError con fallback al fallar', async () => {
        seedSession();
        server.use(
            http.get(`${API_BASE}/api/pagos/metodos`, () =>
                HttpResponse.json(null, { status: 500 })
            )
        );

        await expect(listarMetodosPago()).rejects.toThrow(
            'Error al listar los metodos de pago'
        );
    });

    it('expone ApiError con name, status y data', async () => {
        seedSession();
        server.use(
            http.get(`${API_BASE}/api/ordenes`, () =>
                HttpResponse.json({ error: 'Fallo' }, { status: 500 })
            )
        );

        try {
            await orderApi.listarMisOrdenes();
            throw new Error('debería haber fallado');
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            expect((error as ApiError).status).toBe(500);
        }
    });
});
