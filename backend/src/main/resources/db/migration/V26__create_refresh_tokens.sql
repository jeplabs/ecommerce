CREATE TABLE refresh_tokens (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash      VARCHAR(64) NOT NULL UNIQUE,
    family_id       VARCHAR(36) NOT NULL,
    expira_at       TIMESTAMP NOT NULL,
    revocado        BOOLEAN NOT NULL DEFAULT FALSE,
    reemplazado_por BIGINT REFERENCES refresh_tokens(id),
    creado_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(512)
);

CREATE INDEX idx_refresh_tokens_usuario_id ON refresh_tokens(usuario_id);
CREATE INDEX idx_refresh_tokens_family_id ON refresh_tokens(family_id);
CREATE INDEX idx_refresh_tokens_expira_at ON refresh_tokens(expira_at);
