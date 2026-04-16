CREATE TABLE direcciones (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  BIGINT NOT NULL REFERENCES usuarios(id),
    alias       VARCHAR(50) NOT NULL,
    direccion       VARCHAR(255) NOT NULL,
    ciudad      VARCHAR(100) NOT NULL,
    estado      VARCHAR(100),
    codigo_postal VARCHAR(20),
    pais        VARCHAR(100) NOT NULL,
    telefono    VARCHAR(20) NOT NULL,
    referencias   VARCHAR(500),
    principal   BOOLEAN NOT NULL DEFAULT FALSE,
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);