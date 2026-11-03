-- =============================================================================
-- V1__init_schema.sql
-- Esquema consolidado de base de datos para JEPLabs E-Commerce (PostgreSQL)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Seguridad y Usuarios
-- -----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id                      BIGSERIAL PRIMARY KEY,
    nombre                  VARCHAR(100) NOT NULL,
    apellido                VARCHAR(100) NOT NULL DEFAULT '',
    pais                    VARCHAR(100) NOT NULL DEFAULT '',
    email                   VARCHAR(255) NOT NULL UNIQUE,
    password                VARCHAR(255) NOT NULL,
    rol                     VARCHAR(20) NOT NULL DEFAULT 'ROLE_CUSTOMER',
    activo                  BOOLEAN NOT NULL DEFAULT TRUE,
    intentos_fallidos       INTEGER NOT NULL DEFAULT 0,
    bloqueado               BOOLEAN NOT NULL DEFAULT FALSE,
    ultimo_intento_fallido  TIMESTAMP
);

CREATE TABLE password_reset_tokens (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  BIGINT NOT NULL REFERENCES usuarios(id),
    token       VARCHAR(255) NOT NULL UNIQUE,
    expira_at   TIMESTAMP NOT NULL,
    usado       BOOLEAN NOT NULL DEFAULT FALSE,
    creado_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

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
CREATE INDEX idx_refresh_tokens_family_id  ON refresh_tokens(family_id);
CREATE INDEX idx_refresh_tokens_expira_at  ON refresh_tokens(expira_at);

-- -----------------------------------------------------------------------------
-- 2. Catálogo y Favoritos
-- -----------------------------------------------------------------------------
CREATE TABLE categorias (
    id          BIGSERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    parent_id   BIGINT REFERENCES categorias(id)
);

CREATE TABLE productos (
    id          BIGSERIAL PRIMARY KEY,
    sku         VARCHAR(100) NOT NULL UNIQUE,
    nombre      VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    specs       JSONB,
    stock       INTEGER NOT NULL DEFAULT 0,
    estado      VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    version     INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE precio_historial (
    id              BIGSERIAL PRIMARY KEY,
    producto_id     BIGINT NOT NULL REFERENCES productos(id),
    precio_venta    NUMERIC(10,2) NOT NULL,
    precio_costo    NUMERIC(10,2) NOT NULL,
    moneda          VARCHAR(10) NOT NULL DEFAULT 'USD',
    fecha_inicio    TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_fin       TIMESTAMP
);

CREATE TABLE producto_categorias (
    producto_id     BIGINT NOT NULL REFERENCES productos(id),
    categoria_id    BIGINT NOT NULL REFERENCES categorias(id),
    PRIMARY KEY (producto_id, categoria_id)
);

CREATE TABLE producto_imagenes (
    id          BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL REFERENCES productos(id),
    url         VARCHAR(500) NOT NULL,
    principal   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE favoritos (
    usuario_id  BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    creado_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, producto_id),
    CONSTRAINT fk_favoritos_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
    CONSTRAINT fk_favoritos_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 3. Ubicaciones, Envíos y Configuración de Pagos
-- -----------------------------------------------------------------------------
CREATE TABLE direcciones (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      BIGINT NOT NULL REFERENCES usuarios(id),
    alias           VARCHAR(50) NOT NULL,
    direccion       VARCHAR(255) NOT NULL,
    ciudad          VARCHAR(100) NOT NULL,
    estado          VARCHAR(100),
    codigo_postal   VARCHAR(20),
    pais            VARCHAR(100) NOT NULL,
    telefono        VARCHAR(20) NOT NULL,
    referencias     VARCHAR(500),
    principal       BOOLEAN NOT NULL DEFAULT FALSE,
    activo          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE sucursales (
    id                  BIGSERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    direccion           VARCHAR(255) NOT NULL,
    ciudad              VARCHAR(100) NOT NULL,
    estado              VARCHAR(100),
    codigo_postal       VARCHAR(20),
    pais                VARCHAR(100) NOT NULL DEFAULT 'GT',
    telefono            VARCHAR(30) NOT NULL,
    horario             VARCHAR(255) NOT NULL,
    referencias         VARCHAR(500),
    mapa_url            VARCHAR(500),
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    orden_visualizacion INTEGER NOT NULL DEFAULT 1,
    creado_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE servicios_envio (
    id                      BIGSERIAL PRIMARY KEY,
    nombre                  VARCHAR(100) NOT NULL,
    descripcion             VARCHAR(255),
    tarifa                  NUMERIC(10,2) NOT NULL DEFAULT 0,
    recargo_contra_entrega  NUMERIC(10,2) NOT NULL DEFAULT 0,
    activo                  BOOLEAN NOT NULL DEFAULT TRUE,
    logo_url                VARCHAR(500),
    sin_contra_entrega      BOOLEAN NOT NULL DEFAULT FALSE,
    retiro_tienda           BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE cuentas_bancarias (
    id                  BIGSERIAL PRIMARY KEY,
    banco               VARCHAR(100) NOT NULL,
    titular             VARCHAR(150) NOT NULL,
    tipo_cuenta         VARCHAR(50) NOT NULL,
    numero_cuenta       VARCHAR(50) NOT NULL,
    moneda              VARCHAR(10) NOT NULL DEFAULT 'GTQ',
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    orden_visualizacion INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE metodos_pago (
    id                  BIGSERIAL PRIMARY KEY,
    codigo              VARCHAR(50) NOT NULL UNIQUE,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         VARCHAR(255),
    tipo                VARCHAR(30) NOT NULL,
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    orden_visualizacion INTEGER NOT NULL DEFAULT 1,
    configuracion       JSONB
);

-- -----------------------------------------------------------------------------
-- 4. Carrito, Órdenes y Pasarelas de Pago
-- -----------------------------------------------------------------------------
CREATE TABLE carritos (
    id                      BIGSERIAL PRIMARY KEY,
    usuario_id              BIGINT NOT NULL REFERENCES usuarios(id),
    estado                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    expira_at               TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '72 hours',
    notificacion_enviada    BOOLEAN NOT NULL DEFAULT FALSE,
    creado_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_at          TIMESTAMP NOT NULL DEFAULT NOW()
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

CREATE TABLE ordenes (
    id                      BIGSERIAL PRIMARY KEY,
    usuario_id              BIGINT NOT NULL REFERENCES usuarios(id),
    direccion_id            BIGINT REFERENCES direcciones(id) ON DELETE SET NULL,
    sucursal_id             BIGINT REFERENCES sucursales(id) ON DELETE SET NULL,
    servicio_envio_id       BIGINT REFERENCES servicios_envio(id) ON DELETE SET NULL,
    forma_pago_envio        VARCHAR(20) NOT NULL DEFAULT 'CONTRA_ENTREGA',
    costo_envio             NUMERIC(10,2) NOT NULL DEFAULT 0,
    estado                  VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    metodo_pago             VARCHAR(50),
    comprobante_url         VARCHAR(500),
    comprobante_nombre      VARCHAR(255),
    comprobante_fecha       TIMESTAMP,
    nota_envio              VARCHAR(255),

    -- Snapshot inmutable de dirección de entrega o sucursal de retiro
    direccion_alias         VARCHAR(50) NOT NULL,
    direccion_calle         VARCHAR(255) NOT NULL,
    direccion_ciudad        VARCHAR(100) NOT NULL,
    direccion_estado        VARCHAR(100),
    direccion_codigo_postal VARCHAR(20),
    direccion_pais          VARCHAR(100) NOT NULL,
    direccion_telefono      VARCHAR(20) NOT NULL,
    direccion_referencias   VARCHAR(500),
    sucursal_horario        VARCHAR(255),

    -- Totales
    subtotal                NUMERIC(10,2) NOT NULL,
    iva                     NUMERIC(10,2) NOT NULL,
    total                   NUMERIC(10,2) NOT NULL,

    notas                   TEXT,
    creado_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE orden_items (
    id              BIGSERIAL PRIMARY KEY,
    orden_id        BIGINT NOT NULL REFERENCES ordenes(id),
    producto_id     BIGINT NOT NULL REFERENCES productos(id),

    -- Snapshot del producto al momento de la compra
    sku             VARCHAR(100) NOT NULL,
    nombre_producto VARCHAR(255) NOT NULL,

    cantidad        INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    precio_base     NUMERIC(10,2) NOT NULL,
    iva_unitario    NUMERIC(10,2) NOT NULL,
    subtotal        NUMERIC(10,2) NOT NULL
);

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

CREATE TABLE qpaypro_transacciones (
    id                  BIGSERIAL PRIMARY KEY,
    orden_id            BIGINT NOT NULL,
    token               VARCHAR(255),
    transaction_id      VARCHAR(255),
    estado              VARCHAR(50) NOT NULL,
    monto               NUMERIC(10,2) NOT NULL,
    md5_hash_response   VARCHAR(255),
    cuotas              INTEGER,
    fel_uuid            VARCHAR(255),
    fel_serie           VARCHAR(100),
    fel_numero          VARCHAR(100),
    creado_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_at      TIMESTAMP,
    CONSTRAINT fk_qpaypro_orden FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE
);
