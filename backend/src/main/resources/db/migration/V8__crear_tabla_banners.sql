-- =============================================================================
-- V8__crear_tabla_banners.sql
-- Tabla para gestión de banners y contenido visual del Home
-- =============================================================================

CREATE TABLE banners (
    id           BIGSERIAL PRIMARY KEY,
    seccion      VARCHAR(50) NOT NULL DEFAULT 'HERO_CAROUSEL',
    titulo       VARCHAR(150) NOT NULL,
    desktop_url  VARCHAR(500) NOT NULL,
    mobile_url   VARCHAR(500),
    link_url     VARCHAR(500),
    orden        INTEGER NOT NULL DEFAULT 1,
    activo       BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_inicio TIMESTAMP,
    fecha_fin    TIMESTAMP,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_banners_seccion_activo_orden ON banners (seccion, activo, orden, id);
