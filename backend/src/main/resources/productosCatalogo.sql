-- ================================================================
-- SCRIPT DE CARGA DE PRODUCTOS - JEPLabs Ecommerce
-- Generado para PostgreSQL
-- Incluye: Productos, Imágenes, Precios Vigentes y Categorías
-- ================================================================

-- 1. LIMPIEZA DE DATOS (PRECAUCIÓN)
-- Descomenta las siguientes líneas SOLO si quieres borrar todos los productos existentes.
-- ADVERTENCIA: Esto eliminará productos, imágenes asociadas y historial de precios.
-- TRUNCATE TABLE producto_categorias, producto_imagenes, precio_historial, productos RESTART IDENTITY CASCADE;

-- 2. INSERCIÓN DE PRODUCTOS
-- Se fuerzan los IDs para mantener la consistencia con los datos exportados.
INSERT INTO productos (id, sku, nombre, slug, descripcion, specs, stock, estado, created_at, updated_at)
VALUES 
(2, 'SKU: U7LNL321TBWPS_3PSXCTO2N1', 'Notebook Dell Ultrabook Pro Plus14 2in1 Intel Ultra 7 268V 32GB 1TB 14"TouchW11P', 'notebook-dell-ultrabook-pro-plus14-2in1-intel-ultra-7-268v-32gb-1tb-14touchw11p', 
'Descubre la potencia y versatilidad del Dell Ultrabook Pro Plus 14 2 en 1, un dispositivo diseñado para satisfacer las necesidades de los profesionales modernos. Equipado con un procesador Intel® Core™ Ultra 7 268V, este ultrabook cuenta con 8 núcleos que ofrecen un rendimiento excepcional, alcanzando frecuencias de hasta 5 GHz en modo turbo. Con su arquitectura avanzada, podrás realizar múltiples tareas sin esfuerzo, desde la edición de videos hasta la programación, todo con una fluidez impresionante.

La memoria RAM de 32 GB LPDDR5X a 8533 MHz garantiza que puedas ejecutar aplicaciones pesadas y mantener múltiples pestañas abiertas sin comprometer la velocidad. Además, su unidad SSD de 1 TB proporciona un amplio espacio de almacenamiento y tiempos de carga ultrarrápidos, permitiéndote acceder a tus archivos y aplicaciones en un instante.

La pantalla táctil de 14.0 pulgadas con una resolución de 1920 x 1200 ofrece imágenes nítidas y vibrantes, ideal para presentaciones, diseño gráfico o simplemente disfrutar de tus series favoritas. Con una frecuencia de actualización de 60 Hz, cada movimiento en la pantalla es suave y sin interrupciones. La tecnología LED asegura que los colores sean brillantes y los contrastes profundos, mejorando tu experiencia visual.

En cuanto a la conectividad, el Dell Pro Plus 14 2 en 1 no decepciona. Con WiFi 7 tribanda y Bluetooth 5.4, podrás disfrutar de conexiones rápidas y estables. Además, cuenta con múltiples puertos, incluyendo 2x Thunderbolt 4, 1x HDMI 2.1 y 2x USB 5Gbps Type-A, lo que te permite conectar fácilmente tus dispositivos y accesorios.

El diseño del ultrabook es elegante y funcional, con un acabado en gris que le da un toque moderno. Con dimensiones de 314 x 224 x 20 mm y un peso de solo 1550 g, es lo suficientemente ligero como para llevarlo contigo a cualquier lugar. La batería de 5Wh con carga rápida ExpressCharge Boost asegura que puedas trabajar durante horas sin preocuparte por la carga.

El Dell Pro Plus 14 2 en 1 también incluye una cámara frontal Quad HD de 5.2 MP y un sistema de audio de alta calidad con altavoces Cirrus Logic, lo que lo convierte en una excelente opción para videoconferencias y entretenimiento. Con el sistema operativo Microsoft Windows® 11 Pro, tendrás acceso a las últimas características y actualizaciones de seguridad.

Con una garantía de 1 año, el Dell Ultrabook Pro Plus 14 2 en 1 es la elección perfecta para quienes buscan un dispositivo potente, portátil y versátil. Ya sea para trabajar, estudiar o disfrutar de tu contenido favorito, este ultrabook está diseñado para superar tus expectativas.', 
'{"RAM": "32 GB LPDDR5X (8533 MHz)", "Audio": "2 altavoces 2.5W, doble micrófono", "Marca": "Dell", "Pantalla": "14.0\" LED (1920x1200) táctil / 60 Hz", "Procesador": "Pro Plus 14 2 in 1", "Cámara Web": "Cámara frontal Quad HD 5.2MP IR", "Almacenamiento": "SSD 1TB", "Frecuencia CPU": "2.2 GHz", "Tarjeta Gráfica": "Intel Arc Graphics 140V (Integrada)"}', 
10, 'DISPONIBLE', '2026-04-02 15:00:58.31554', '2026-04-02 16:51:04.808774'),

(3, 'A14LPLA', 'Notebook Gamer HP Victus Ryzen 7 8845HS RAM 16GB SSD 1TB 15.6" RTX4050 6GB W11H', 'notebook-gamer-hp-victus-ryzen-7-8845hs-ram-16gb-ssd-1tb-156-rtx4050-6gb-w11h', 
'La Notebook Gamer HP Victus 15-FB2019LA es la elección perfecta para los entusiastas de los videojuegos que buscan un rendimiento excepcional y una experiencia visual envolvente. Equipado con un potente procesador AMD Ryzen™ 7 8845HS, que cuenta con 8 núcleos y 16 hilos, esta laptop ofrece una frecuencia base de 3.8 GHz y puede alcanzar hasta 5.1 GHz en modo turbo, garantizando un rendimiento fluido incluso en las tareas más exigentes.

La memoria RAM de 16 GB DDR5 a 5600 MHz permite una multitarea sin interrupciones, mientras que el almacenamiento SSD de 1 TB proporciona un acceso rápido a tus juegos y aplicaciones, reduciendo los tiempos de carga y mejorando la eficiencia general del sistema. Con una pantalla de 15.6 pulgadas y resolución Full HD (1920 x 1080), disfrutarás de gráficos nítidos y colores vibrantes, gracias a su tecnología IPS y un brillo de 300 nits.

La tarjeta gráfica NVIDIA GeForce RTX 4050 con 6 GB de memoria GDDR6 dedicada asegura que puedas jugar a los títulos más recientes con configuraciones gráficas altas, ofreciendo una experiencia de juego fluida y envolvente. Además, la laptop cuenta con una tasa de refresco de 144 Hz, lo que mejora la jugabilidad en títulos de acción rápida.

En términos de conectividad, la HP Victus está equipada con una variedad de puertos, incluyendo 2 puertos USB Type-A, 1 puerto USB Type-C con soporte para DisplayPort, 1 puerto HDMI 2.1 y un puerto RJ-45 para conexión de red. También incluye conectividad inalámbrica avanzada con Wi-Fi 6E y Bluetooth 5.3, asegurando que estés siempre conectado.

El diseño de la laptop es elegante y funcional, con un teclado retroiluminado de tamaño completo que incluye un teclado numérico, ideal para largas sesiones de juego. La batería de polímero de litio de 4 celdas ofrece una capacidad de 70 Wh, proporcionando una autonomía de hasta 7.75 horas, lo que te permite jugar y trabajar sin preocuparte por la carga.

Con un peso de solo 2.29 kg y dimensiones compactas de 358 x 255 x 24 mm, la HP Victus es fácil de transportar, lo que la convierte en una opción ideal para gamers en movimiento. Además, cuenta con un sistema de audio DTS:X Ultra y altavoces duales que mejoran la experiencia de inmersión en tus juegos y películas.

La Notebook Gamer HP Victus 15-FB2019LA no solo es una máquina potente, sino que también está diseñada con la sostenibilidad en mente, cumpliendo con certificaciones como EPEAT Gold y ENERGY STAR. Con su combinación de rendimiento, portabilidad y características avanzadas, esta laptop es una opción excepcional para cualquier gamer que busque llevar su experiencia de juego al siguiente nivel.', 
'{"RAM": "16GB", "Procesador": "Ryzen 7", "Almacenamiento": "1TB", "Sistema Operativo": "Windows 11 Home", "Tamaño de pantalla ": "15.6"}', 
20, 'DISPONIBLE', '2026-04-03 18:09:20.526203', '2026-04-03 18:09:20.526203'),

(4, 'C2NM9LT', 'Notebook Workstation HP ZBook X G1i Ultra 7 255HX RAM32GB SSD1TB 16" W11P', 'notebook-workstation-hp-zbook-x-g1i-ultra-7-255hx-ram32gb-ssd1tb-16-w11p', 
'La Notebook Workstation HP ZBook X G1i es una potente herramienta diseñada para profesionales que requieren un rendimiento excepcional en sus tareas diarias. Con un procesador Intel® Core™ Ultra 7 255HX, que cuenta con 20 núcleos (8 de rendimiento y 12 de eficiencia), esta workstation es capaz de manejar múltiples aplicaciones y procesos simultáneamente, garantizando una experiencia fluida y eficiente. Su frecuencia base de 2.3 GHz puede alcanzar hasta 5.2 GHz en modo turbo, lo que la convierte en una opción ideal para trabajos que demandan alta capacidad de procesamiento.

Equipado con 32 GB de RAM DDR5 a 5600 MT/s, el HP ZBook X G1i asegura un rendimiento ágil y rápido, permitiendo a los usuarios ejecutar aplicaciones pesadas y realizar multitasking sin inconvenientes. Además, su almacenamiento SSD de 1 TB proporciona una velocidad de lectura y escritura de 500 MB/s, lo que se traduce en tiempos de carga reducidos y un acceso rápido a los datos.

La pantalla de 16 pulgadas con resolución WUXGA (1920 x 1200) ofrece imágenes nítidas y vibrantes, gracias a su tecnología IPS y un brillo de 300 nits. Esta característica es especialmente útil para diseñadores gráficos, editores de video y otros profesionales creativos que requieren precisión en los colores y detalles. La pantalla antirreflectante también permite trabajar en diversas condiciones de iluminación sin distracciones.

En términos de conectividad, la HP ZBook X G1i no decepciona. Dispone de múltiples puertos, incluyendo 2 puertos Thunderbolt 4, 2 puertos USB 5Gbps Type-A, 1 HDMI 2.1 y un puerto RJ45 para conexiones de red rápidas y estables. Además, cuenta con la última tecnología de Wi-Fi 7 (802.11be) y Bluetooth 5.4, asegurando que siempre estés conectado de manera eficiente.

La batería de polímero de litio de 6 celdas y 83 Wh proporciona una duración prolongada, ideal para aquellos que necesitan trabajar en movimiento. Con la capacidad de carga rápida, puedes obtener hasta un 50% de carga en solo 30 minutos, lo que es perfecto para días ajetreados.

El diseño del HP ZBook X G1i es elegante y funcional, con un teclado retroiluminado resistente a salpicaduras que incluye un teclado numérico, lo que facilita la entrada de datos. Además, la presencia de un lector de huellas digitales y opciones de protección mediante contraseña garantizan la seguridad de tus datos y proyectos.

Con un peso de aproximadamente 2.04 kg y dimensiones compactas de 359 x 230 x 23 mm, esta workstation es lo suficientemente portátil para llevarla a cualquier lugar, sin sacrificar el rendimiento. La HP ZBook X G1i es, sin duda, una opción excepcional para aquellos que buscan una computadora portátil potente y confiable para sus necesidades profesionales.', 
'{"RAM": "32GB", "Procesador": "Ultra 7", "Almacenamiento": "1TB", "Sistema operativo": "Windows 11 Pro", "Tamaño de pantalla": "16"}', 
20, 'DISPONIBLE', '2026-04-03 18:12:52.147512', '2026-04-03 18:12:52.147512');

-- 3. INSERCIÓN DE IMÁGENES
-- Se asume que la tabla es 'producto_imagenes' y tiene una columna 'principal' (boolean).
INSERT INTO producto_imagenes (id, producto_id, url, principal)
VALUES 
(3, 2, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/2uao9ivfd3uzw8b8q433ffrmh929?_a=BACCd2Ev', true),
(4, 2, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/2uao9ivfd3uzw8b8q433ffrmh929?_a=BACCd2Ev', false),
(5, 2, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/2uao9ivfd3uzw8b8q433ffrmh929?_a=BACCd2Ev', false),
(6, 3, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/ij1yd3s3dmjwa5ozwfes75m8dhd0?_a=BACCd2Ev', true),
(7, 3, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/eaw9r90ikafg2713fqlbq8szgj6u?_a=BACCd2Ev', false),
(8, 3, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/rbjveemb2kkfqzlfvd8tp6mhbywa?_a=BACCd2Ev', false),
(9, 4, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/gh10i3duy6896vl51ij5ws5zcn34?_a=BACCd2Ev', true),
(10, 4, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/jb8clvuqhcfzx0qch47hkvas16q5?_a=BACCd2Ev', false),
(11, 4, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/lvlmnj20eoryz8ivohztt3ynyjko?_a=BACCd2Ev', false);

-- 4. INSERCIÓN DE PRECIOS VIGENTES
-- Se inserta SOLO el precio actual (fecha_fin NULL) para evitar historial innecesario en el seed.
-- Si tu tabla se llama 'precio_historial' pero usas la fila con fecha_fin NULL como precio activo:
INSERT INTO precio_historial (producto_id, precio_venta, precio_costo, moneda, fecha_inicio, fecha_fin)
VALUES 
(2, 1900.00, 1900.00, 'USD', NOW(), NULL),
(3, 999.00, 999.00, 'USD', NOW(), NULL),
(4, 2199.00, 2199.00, 'USD', NOW(), NULL);

-- 5. ASOCIACIÓN DE CATEGORÍAS
-- Vincula los productos con sus categorías respectivas.
INSERT INTO producto_categorias (producto_id, categoria_id)
VALUES 
-- Producto 2 (Dell)
(2, 1), (2, 7), (2, 26),
-- Producto 3 (HP Victus)
(3, 1), (3, 7), (3, 25),
-- Producto 4 (HP ZBook)
(4, 1), (4, 7), (4, 27);

-- 6. REINICIO DE SECUENCIAS
-- CRÍTICO: Ajusta las secuencias para que el próximo ID automático sea el correcto.
-- Esto evita errores de "duplicate key" al crear nuevos productos desde el frontend.

-- Secuencia de Productos (El último ID es 4, el siguiente debe ser 5)
SELECT setval('productos_id_seq', (SELECT MAX(id) FROM productos));

-- Secuencia de Imágenes (El último ID es 11, el siguiente debe ser 12)
SELECT setval('producto_imagenes_id_seq', (SELECT MAX(id) FROM producto_imagenes));

-- Secuencia de Precios (Opcional, si usa secuencia propia. Si no, ignorar)
-- Asumiendo que hay una secuencia para la tabla de precios
-- SELECT setval('precio_historial_id_seq', (SELECT MAX(id) FROM precio_historial));

-- Fin del script