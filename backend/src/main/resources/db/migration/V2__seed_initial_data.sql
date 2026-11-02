-- =============================================================================
-- V2__seed_initial_data.sql
-- Datos operativos base requeridos por el flujo de Checkout y Administración
-- =============================================================================

-- 1. Métodos de Pago
INSERT INTO metodos_pago (codigo, nombre, descripcion, tipo, activo, orden_visualizacion)
VALUES
    ('STRIPE',         'Tarjeta (Stripe)',       'Visa, Mastercard y más',       'PASARELA',       true,  1),
    ('MERCADO_PAGO',   'Mercado Pago',           'Latam - tarjeta o saldo',      'PASARELA',       true,  2),
    ('WEBPAY',         'Webpay Plus',            'Transbank - Chile',            'PASARELA',       false, 3),
    ('TRANSFERENCIA',  'Transferencia bancaria', 'Depósito pendiente',           'TRANSFERENCIA',  true,  4),
    ('CONTRA_ENTREGA', 'Pago contra entrega',    'Paga al recibir tu pedido',    'CONTRA_ENTREGA', true,  5),
    ('QPAYPRO',        'QPayPro',                'Visa, Mastercard - Guatemala', 'PASARELA',       true,  6)
ON CONFLICT (codigo) DO NOTHING;

-- 2. Servicios de Envío (Los 3 tipos activos usados en el Checkout: Retiro, Normal y Express)
INSERT INTO servicios_envio (
    nombre, descripcion, tarifa, recargo_contra_entrega, activo, sin_contra_entrega, retiro_tienda
) VALUES
    ('Retiro en tienda', 'Recoge tu pedido en nuestra sucursal', 0.00,  0.00,  true, false, true),
    ('Cargo Express',    'Servicio de entrega Cargo Express',    35.00, 10.00, true, false, false),
    ('Guatex',           'Servicio de entrega express Guatex',   45.00, 15.00, true, true,  false);

-- 3. Sucursales Físicas para Retiro en Tienda
INSERT INTO sucursales (
    nombre, direccion, ciudad, estado, codigo_postal, pais,
    telefono, horario, referencias, mapa_url, activo, orden_visualizacion
) VALUES
    (
        'Tienda Centro',
        'Av. Principal 123, Ciudad de Guatemala',
        'Ciudad de Guatemala',
        'Guatemala',
        '01001',
        'GT',
        '+502 2345-6789',
        'Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00',
        'Zona 1, Centro Histórico',
        NULL,
        true,
        1
    ),
    (
        'Tienda Zona 10',
        'Boulevard Los Proceres 5-50, Zona 10',
        'Ciudad de Guatemala',
        'Guatemala',
        '01010',
        'GT',
        '+502 2456-7890',
        'Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00',
        'Plaza Comercial Zona 10',
        NULL,
        true,
        2
    );

-- 4. Cuenta Bancaria Inicial para Transferencias
INSERT INTO cuentas_bancarias (banco, titular, tipo_cuenta, numero_cuenta, moneda, activo, orden_visualizacion)
VALUES ('Banrural', 'JPELabs S.A.', 'Monetaria', '4521-8834-9901', 'GTQ', true, 1);
