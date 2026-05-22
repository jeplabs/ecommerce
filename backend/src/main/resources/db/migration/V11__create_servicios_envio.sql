CREATE TABLE servicios_envio (
    id                      BIGSERIAL PRIMARY KEY,
    nombre                  VARCHAR(100) NOT NULL,
    descripcion             VARCHAR(255),
    tarifa                  NUMERIC(10,2) NOT NULL DEFAULT 0,
    recargo_contra_entrega  NUMERIC(10,2) NOT NULL DEFAULT 0,
    activo                  BOOLEAN NOT NULL DEFAULT TRUE,
    logo_url                VARCHAR(500)
);

ALTER TABLE ordenes
    ADD COLUMN servicio_envio_id    BIGINT REFERENCES servicios_envio(id) ON DELETE SET NULL,
    ADD COLUMN costo_envio          NUMERIC(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN forma_pago           VARCHAR(20) NOT NULL DEFAULT 'CONTRA_ENTREGA';

-- Datos iniciales de ejemplo
INSERT INTO servicios_envio (nombre, descripcion, tarifa, recargo_contra_entrega, activo)
VALUES
    ('Guatex', 'Servicio de entrega Guatex', 45.00, 15.00, true),
    ('Cargo Express', 'Servicio de entrega Cargo Express', 35.00, 10.00, true);