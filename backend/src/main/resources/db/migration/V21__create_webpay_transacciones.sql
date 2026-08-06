CREATE TABLE webpay_transacciones (
    id                  BIGSERIAL PRIMARY KEY,
    orden_id            BIGINT NOT NULL REFERENCES ordenes(id),
    token               VARCHAR(255) NOT NULL UNIQUE,
    buy_order           VARCHAR(50) NOT NULL UNIQUE,
    session_id          VARCHAR(50) NOT NULL,
    monto               NUMERIC(10,2) NOT NULL,
    estado              VARCHAR(20) NOT NULL DEFAULT 'INICIADA',
    motivo              VARCHAR(20),
    response_code       SMALLINT,
    authorization_code  VARCHAR(50),
    transaction_id      VARCHAR(100),
    card_number         VARCHAR(10),
    payment_type_code   VARCHAR(10),
    installments        SMALLINT,
    url                 VARCHAR(500),
    creado_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_at      TIMESTAMP NOT NULL DEFAULT NOW()
);