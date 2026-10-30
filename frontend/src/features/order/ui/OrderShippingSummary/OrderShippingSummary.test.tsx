import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OrderShippingSummary from './OrderShippingSummary';
import type { OrderApi } from '@/entities/order';

describe('OrderShippingSummary', () => {
    it('muestra "Dirección de envío" para pedidos normales a domicilio', () => {
        const mockOrder: OrderApi = {
            id: 101,
            estado: 'PENDIENTE',
            direccionId: 5,
            sucursalId: null,
            servicioEnvio: 'Envío estándar',
            formaPagoEnvio: 'EN_LINEA',
            metodoPago: 'STRIPE',
            total: 100,
            subtotal: 90,
            iva: 10,
            costoEnvio: 0,
            notaEnvio: null,
            notas: null,
            creadoAt: '2026-05-28T12:00:00',
            actualizadoAt: '2026-05-28T12:00:00',
            items: [],
            direccionEnvio: {
                alias: 'Casa',
                calle: 'Calle Los Pinos 123',
                ciudad: 'Guatemala',
                estado: 'Guatemala',
                codigoPostal: '01001',
                pais: 'GT',
                telefono: '12345678',
                referencias: 'Portón blanco',
            },
        };

        render(<OrderShippingSummary orden={mockOrder} />);

        expect(screen.getByText('Dirección de envío')).toBeInTheDocument();
        expect(screen.getByText('Casa')).toBeInTheDocument();
        expect(screen.getByText('Calle Los Pinos 123')).toBeInTheDocument();
        expect(screen.queryByText(/Horario:/i)).not.toBeInTheDocument();
    });

    it('muestra "Sucursal de retiro" y horario cuando el pedido es retiro en tienda', () => {
        const mockPickupOrder: OrderApi = {
            id: 102,
            estado: 'PENDIENTE',
            direccionId: null,
            sucursalId: 2,
            servicioEnvio: 'Retiro en tienda',
            formaPagoEnvio: 'EN_LINEA',
            metodoPago: 'TRANSFERENCIA',
            total: 200,
            subtotal: 180,
            iva: 20,
            costoEnvio: 0,
            notaEnvio: null,
            notas: null,
            creadoAt: '2026-05-28T12:00:00',
            actualizadoAt: '2026-05-28T12:00:00',
            items: [],
            direccionEnvio: {
                alias: 'Tienda Zona 10',
                calle: 'Boulevard Los Proceres 5-50, Zona 10',
                ciudad: 'Ciudad de Guatemala',
                estado: 'Guatemala',
                codigoPostal: '01010',
                pais: 'GT',
                telefono: '+502 2456-7890',
                horario: 'Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00',
                referencias: 'Plaza Comercial Zona 10',
            },
        };

        render(<OrderShippingSummary orden={mockPickupOrder} />);

        expect(screen.getByText('Sucursal de retiro')).toBeInTheDocument();
        expect(screen.getByText('Tienda Zona 10')).toBeInTheDocument();
        expect(screen.getByText('Boulevard Los Proceres 5-50, Zona 10')).toBeInTheDocument();
        expect(screen.getByText(/Horario:\s*Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Retiro en tienda/i).length).toBeGreaterThanOrEqual(1);
    });
});
