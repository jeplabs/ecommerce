CREATE TABLE categorias (
    id      BIGSERIAL PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL,
    slug    VARCHAR(100) NOT NULL UNIQUE,
    parent_id BIGINT REFERENCES categorias(id)
);

CREATE TABLE productos (
    id          BIGSERIAL PRIMARY KEY,
    sku         VARCHAR(100) NOT NULL UNIQUE,
    nombre      VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    specs       JSONB,
    stock       INTEGER NOT NULL DEFAULT 0,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE precio_historial (
    id          BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL REFERENCES productos(id),
    precio_venta    NUMERIC(10,2) NOT NULL,
    precio_costo    NUMERIC(10,2) NOT NULL,
    moneda      VARCHAR(10) NOT NULL DEFAULT 'USD',
    fecha_inicio TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_fin   TIMESTAMP
);

CREATE TABLE producto_categorias (
    producto_id  BIGINT NOT NULL REFERENCES productos(id),
    categoria_id BIGINT NOT NULL REFERENCES categorias(id),
    PRIMARY KEY (producto_id, categoria_id)
);

CREATE TABLE producto_imagenes (
    id          BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL REFERENCES productos(id),
    url         VARCHAR(500) NOT NULL,
    principal   BOOLEAN NOT NULL DEFAULT FALSE
);