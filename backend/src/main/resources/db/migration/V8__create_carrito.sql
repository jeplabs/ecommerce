CREATE TABLE carritos (
    id            BIGSERIAL PRIMARY KEY,
    usuario_id    BIGINT NOT NULL REFERENCES usuarios(id),
    estado        VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    creado_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE carrito_items (
    id              BIGSERIAL PRIMARY KEY,
    carrito_id      BIGINT NOT NULL REFERENCES carritos(id),
    producto_id     BIGINT NOT NULL REFERENCES productos(id),
    cantidad        INTEGER NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(10,2) NOT NULL,
    agregado_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(carrito_id, producto_id)
);

ALTER TABLE productos ADD COLUMN version INTEGER NOT NULL DEFAULT 0;