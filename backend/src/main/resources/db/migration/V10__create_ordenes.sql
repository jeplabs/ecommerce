CREATE TABLE ordenes (
    id                  BIGSERIAL PRIMARY KEY,
    usuario_id          BIGINT NOT NULL REFERENCES usuarios(id),
    direccion_id BIGINT REFERENCES direcciones(id) ON DELETE SET NULL,
    estado              VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',

    -- Copia de datos de dirección al momento de la orden
    direccion_alias     VARCHAR(50) NOT NULL,
    direccion_calle     VARCHAR(255) NOT NULL,
    direccion_ciudad    VARCHAR(100) NOT NULL,
    direccion_estado    VARCHAR(100),
    direccion_codigo_postal VARCHAR(20),
    direccion_pais      VARCHAR(100) NOT NULL,
    direccion_telefono  VARCHAR(20) NOT NULL,
    direccion_referencias VARCHAR(500),

    -- Totales
    subtotal            NUMERIC(10,2) NOT NULL,
    iva                 NUMERIC(10,2) NOT NULL,
    total               NUMERIC(10,2) NOT NULL,

    notas               TEXT,
    creado_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE orden_items (
    id                  BIGSERIAL PRIMARY KEY,
    orden_id            BIGINT NOT NULL REFERENCES ordenes(id),
    producto_id         BIGINT NOT NULL REFERENCES productos(id),

    -- Copia de datos del producto al momento de la orden
    sku                 VARCHAR(100) NOT NULL,
    nombre_producto     VARCHAR(255) NOT NULL,

    cantidad            INTEGER NOT NULL,
    precio_unitario     NUMERIC(10,2) NOT NULL,
    precio_base         NUMERIC(10,2) NOT NULL,
    iva_unitario        NUMERIC(10,2) NOT NULL,
    subtotal            NUMERIC(10,2) NOT NULL
);