CREATE TABLE metodos_pago (
    id                  BIGSERIAL PRIMARY KEY,
    codigo              VARCHAR(50) NOT NULL UNIQUE,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         VARCHAR(255),
    tipo                VARCHAR(30) NOT NULL,
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    orden_visualizacion INTEGER NOT NULL DEFAULT 1,
    configuracion       JSONB
);

-- Datos iniciales
INSERT INTO metodos_pago (codigo, nombre, descripcion, tipo, activo, orden_visualizacion)
VALUES
    ('STRIPE',        'Tarjeta (Stripe)',      'Visa, Mastercard y más',    'PASARELA',       true, 1),
    ('MERCADO_PAGO',  'Mercado Pago',          'Latam - tarjeta o saldo',   'PASARELA',       true, 2),
    ('WEBPAY',        'Webpay Plus',           'Transbank - Chile',         'PASARELA',       false, 3),
    ('TRANSFERENCIA', 'Transferencia bancaria','Depósito pendiente',        'TRANSFERENCIA',  true, 4),
    ('CONTRA_ENTREGA','Pago contra entrega',   'Paga al recibir tu pedido', 'CONTRA_ENTREGA', true, 5);

-- Migrar columna metodo_pago en ordenes a texto libre
ALTER TABLE ordenes ALTER COLUMN metodo_pago TYPE VARCHAR(50);