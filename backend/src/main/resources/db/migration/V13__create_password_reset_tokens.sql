CREATE TABLE password_reset_tokens (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  BIGINT NOT NULL REFERENCES usuarios(id),
    token       VARCHAR(255) NOT NULL UNIQUE,
    expira_at   TIMESTAMP NOT NULL,
    usado       BOOLEAN NOT NULL DEFAULT FALSE,
    creado_at   TIMESTAMP NOT NULL DEFAULT NOW()
);