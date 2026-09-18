CREATE TABLE qpaypro_transacciones (
    id BIGSERIAL PRIMARY KEY,
    orden_id BIGINT NOT NULL,
    token VARCHAR(255),
    transaction_id VARCHAR(255),
    estado VARCHAR(50) NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    md5_hash_response VARCHAR(255),
    cuotas INTEGER,
    fel_uuid VARCHAR(255),
    fel_serie VARCHAR(100),
    fel_numero VARCHAR(100),
    creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_at TIMESTAMP,
    CONSTRAINT fk_qpaypro_orden FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE
);
