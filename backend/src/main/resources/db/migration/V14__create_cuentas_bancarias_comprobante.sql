CREATE TABLE cuentas_bancarias (
    id                  BIGSERIAL PRIMARY KEY,
    banco               VARCHAR(100) NOT NULL,
    titular             VARCHAR(150) NOT NULL,
    tipo_cuenta         VARCHAR(50) NOT NULL,
    numero_cuenta       VARCHAR(50) NOT NULL,
    moneda              VARCHAR(10) NOT NULL DEFAULT 'GTQ',
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    orden_visualizacion INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE ordenes
    ADD COLUMN metodo_pago          VARCHAR(30),
    ADD COLUMN comprobante_url      VARCHAR(500),
    ADD COLUMN comprobante_nombre   VARCHAR(255),
    ADD COLUMN comprobante_fecha    TIMESTAMP;

-- Cuenta bancaria ficticia de ejemplo
INSERT INTO cuentas_bancarias (banco, titular, tipo_cuenta, numero_cuenta, moneda, activo, orden_visualizacion)
VALUES ('Banrural', 'JPELabs S.A.', 'Monetaria', '4521-8834-9901', 'GTQ', true, 1);