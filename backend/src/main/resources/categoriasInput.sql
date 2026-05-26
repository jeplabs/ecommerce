-- ================================================================
-- SCRIPT DE CARGA DE CATEGORÍAS - JEPLabs Ecommerce
-- Generado para PostgreSQL
-- ================================================================

-- 1. LIMPIEZA DE DATOS (PRECAUCIÓN)
-- Descomenta la siguiente línea SOLO si quieres borrar todas las categorías existentes antes de cargar.
-- ADVERTENCIA: Esto eliminará también productos relacionados si hay claves foráneas en CASCADE.
-- TRUNCATE TABLE categorias RESTART IDENTITY CASCADE;

-- 2. INSERCIÓN DE DATOS
-- Se fuerzan los IDs para mantener la jerarquía exacta del CSV.
INSERT INTO categorias (id, nombre, slug, parent_id)
VALUES 
(1, 'Computación', 'computacion', NULL),
(2, 'Smartphones y Tablets', 'smartphones-y-tablets', NULL),
(3, 'Gaming', 'gaming', NULL),
(4, 'Audio, Video y Foto', 'audio-video-y-foto', NULL),
(5, 'Hogar Inteligente', 'hogar-inteligente', NULL),
(6, 'Redes y Conectividad', 'redes-y-conectividad', NULL),
(7, 'Laptops y portátiles', 'laptops-y-portatiles', 1),
(8, 'PC de escritorio', 'pc-de-escritorio', 1),
(9, 'Componentes PC', 'componentes-pc', 1),
(10, 'Smartphones', 'smartphones', 2),
(11, 'Tablets', 'tablets', 2),
(12, 'Accesorios móvil', 'accesorios-movil', 2),
(13, 'Consolas', 'consolas', 3),
(14, 'Periféricos gaming', 'perifericos-gaming', 3),
(15, 'Sillas y escritorios gaming', 'sillas-y-escritorios-gaming', 3),
(16, 'Fotografía y video', 'fotografia-y-video', 4),
(17, 'Audio', 'audio', 4),
(18, 'Televisores y proyectores', 'televisores-y-proyectores', 4),
(19, 'Asistentes y hubs', 'asistentes-y-hubs', 5),
(20, 'Seguridad del hogar', 'seguridad-del-hogar', 5),
(21, 'Electrodomésticos smart', 'electrodomesticos-smart', 5),
(22, 'Redes Wi-Fi', 'redes-wi-fi', 6),
(23, 'Networking profesional', 'networking-profesional', 6),
(24, 'Almacenamiento externo', 'almacenamiento-externo', 6),
(25, 'Gaming Laptop', 'gaming-laptop', 7),
(26, 'Ultrabooks', 'ultrabooks', 7),
(27, 'Workstations', 'workstations', 7),
(28, 'All-in-One', 'all-in-one', 8),
(29, 'Torres/MiniPC', 'torresminipc', 8),
(30, 'Servidores NAS', 'servidores-nas', 8),
(31, 'Procesadores', 'procesadores', 9),
(32, 'RAM', 'ram', 9),
(33, 'Tarjetas gráficas', 'tarjetas-graficas', 9),
(34, 'Almacenamiento', 'almacenamiento', 9),
(35, 'Gama alta', 'gama-alta', 10),
(36, 'Gama media', 'gama-media', 10),
(37, 'Básicos/Prepago', 'basicosprepago', 10),
(38, 'Tablets Android', 'tablets-android', 11),
(39, 'iPads', 'ipads', 11),
(40, 'Tablets 2-en-1', 'tablets-2-en-1', 11),
(41, 'Fundas y protectores', 'fundas-y-protectores', 12),
(42, 'Cargadores', 'cargadores', 12),
(43, 'Cables y adaptadores', 'cables-y-adaptadores', 12),
(44, 'PlayStation', 'playstation', 13),
(45, 'Xbox', 'xbox', 13),
(46, 'Nintendo', 'nintendo', 13),
(47, 'Teclados mecánicos', 'teclados-mecanicos', 14),
(48, 'Ratones y pads', 'ratones-y-pads', 14),
(49, 'Headsets', 'headsets', 14),
(50, 'Sillas gaming', 'sillas-gaming', 15),
(51, 'Escritorios', 'escritorios', 15),
(52, 'Ilumincación RGB', 'ilumincacion-rgb', 15),
(53, 'Cámaras DSLR', 'camaras-dslr', 16),
(54, 'Cámaras Mirrorless', 'camaras-mirrorless', 16),
(55, 'Drones', 'drones', 16),
(56, 'Accesorios foto', 'accesorios-foto', 16),
(57, 'Auriculares y TWS', 'auriculares-y-tws', 17),
(58, 'Altavoces y soundbars', 'altavoces-y-soundbars', 17),
(59, 'Micrófonos', 'microfonos', 17),
(60, 'Smart TV', 'smart-tv', 18),
(61, 'Proyectores', 'proyectores', 18),
(62, 'Accesorios AV', 'accesorios-av', 18),
(63, 'Altavoces inteligentes', 'altavoces-inteligentes', 19),
(64, 'Hubs domótica', 'hubs-domotica', 19),
(65, 'Pantallas Inteligentes', 'pantallas-inteligentes', 19),
(66, 'Cámaras IP', 'camaras-ip', 20),
(67, 'Alarmas y sensores', 'alarmas-y-sensores', 20),
(68, 'Cerraduras Inteligentes', 'cerraduras-inteligentes', 20),
(69, 'Iluminación Inteligente', 'iluminacion-inteligente', 21),
(70, 'Robots aspiradores', 'robots-aspiradores', 21),
(71, 'Enchufes y termostatos', 'enchufes-y-termostatos', 21),
(72, 'Routers', 'routers', 22),
(73, 'Sistemas Mesh', 'sistemas-mesh', 22),
(74, 'Repetidores/Access points', 'repetidoresaccess-points', 22),
(75, 'Switches', 'switches', 23),
(76, 'Firewalls/NAS', 'firewallsnas', 23),
(77, 'Cableado estructurado', 'cableado-estructurado', 23),
(78, 'Discos duros externos', 'discos-duros-externos', 24),
(79, 'SSDs portátiles', 'ssds-portatiles', 24),
(80, 'USBs y tarjetas SD', 'usbs-y-tarjetas-sd', 24);

-- 3. REINICIO DE SECUENCIA
-- Esto es CRÍTICO. Ajusta la secuencia para que el próximo ID automático sea 81.
-- Evita errores de "duplicate key value violates unique constraint" en futuros inserts.
-- Asumimos que la secuencia se llama 'categorias_id_seq'. Si tu tabla tiene otro nombre de secuencia, ajústalo aquí.
SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias));

-- Fin del script