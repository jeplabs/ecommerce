CREATE TABLE favoritos (
    usuario_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, producto_id),
    CONSTRAINT fk_favoritos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_favoritos_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);
