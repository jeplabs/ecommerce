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

-- Datos iniciales (reemplazo del mock en frontend)
INSERT INTO sucursales (
    nombre, direccion, ciudad, estado, codigo_postal, pais,
    telefono, horario, referencias, mapa_url, activo, orden_visualizacion
) VALUES
    (
        'Tienda Centro',
        'Av. Principal 123, Ciudad de Guatemala',
        'Ciudad de Guatemala',
        'Guatemala',
        '01001',
        'GT',
        '+502 2345-6789',
        'Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00',
        'Zona 1, Centro Histórico',
        NULL,
        true,
        1
    ),
    (
        'Tienda Zona 10',
        'Boulevard Los Proceres 5-50, Zona 10',
        'Ciudad de Guatemala',
        'Guatemala',
        '01010',
        'GT',
        '+502 2456-7890',
        'Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00',
        'Plaza Comercial Zona 10',
        NULL,
        true,
        2
    );

-- Flag explícito de retiro en tienda para servicios de envío
ALTER TABLE servicios_envio
    ADD COLUMN retiro_tienda BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE servicios_envio
SET retiro_tienda = TRUE
WHERE LOWER(nombre) LIKE '%retiro%';

-- Relación con sucursales y snapshot de horario en órdenes
ALTER TABLE ordenes
    ADD COLUMN sucursal_id      BIGINT REFERENCES sucursales(id) ON DELETE SET NULL,
    ADD COLUMN sucursal_horario VARCHAR(255);
