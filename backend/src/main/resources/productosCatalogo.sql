-- ================================================================
-- SCRIPT DE CARGA DE PRODUCTOS - JEPLabs Ecommerce
-- Generado para PostgreSQL
-- Incluye: Productos, Imágenes, Precios Vigentes y Categorías
-- Última actualización: Septiembre 2026 (10 productos)
-- REQUISITO: Ejecutar categoriasInput.sql ANTES de este script.
-- ================================================================

-- 1. LIMPIEZA DE DATOS (PRECAUCIÓN)
-- Descomenta las siguientes líneas SOLO si quieres borrar todos los productos existentes.
-- ADVERTENCIA: Esto eliminará productos, imágenes asociadas y historial de precios.
-- TRUNCATE TABLE producto_categorias, producto_imagenes, precio_historial, productos RESTART IDENTITY CASCADE;

-- 2. INSERCIÓN DE PRODUCTOS
-- Se fuerzan los IDs para mantener la consistencia con las relaciones del script.

-- ── Laptops y portátiles ────────────────────────────────────────

INSERT INTO productos (id, sku, nombre, slug, descripcion, specs, stock, estado, version, created_at, updated_at)
VALUES
(1, 'U7LNL321TBWPS_3PSXCTO2N1', 'Notebook Dell Ultrabook Pro Plus14 2in1 Intel Ultra 7 268V 32GB 1TB 14"TouchW11P', 'notebook-dell-ultrabook-pro-plus14-2in1-intel-ultra-7-268v-32gb-1tb-14touchw11p',
'Descubre la potencia y versatilidad del Dell Ultrabook Pro Plus 14 2 en 1, un dispositivo diseñado para satisfacer las necesidades de los profesionales modernos. Equipado con un procesador Intel® Core™ Ultra 7 268V, este ultrabook cuenta con 8 núcleos que ofrecen un rendimiento excepcional, alcanzando frecuencias de hasta 5 GHz en modo turbo. Con su arquitectura avanzada, podrás realizar múltiples tareas sin esfuerzo, desde la edición de videos hasta la programación, todo con una fluidez impresionante.

La memoria RAM de 32 GB LPDDR5X a 8533 MHz garantiza que puedas ejecutar aplicaciones pesadas y mantener múltiples pestañas abiertas sin comprometer la velocidad. Además, su unidad SSD de 1 TB proporciona un amplio espacio de almacenamiento y tiempos de carga ultrarrápidos, permitiéndote acceder a tus archivos y aplicaciones en un instante.

La pantalla táctil de 14.0 pulgadas con una resolución de 1920 x 1200 ofrece imágenes nítidas y vibrantes, ideal para presentaciones, diseño gráfico o simplemente disfrutar de tus series favoritas. Con una frecuencia de actualización de 60 Hz, cada movimiento en la pantalla es suave y sin interrupciones. La tecnología LED asegura que los colores sean brillantes y los contrastes profundos, mejorando tu experiencia visual.

En cuanto a la conectividad, el Dell Pro Plus 14 2 en 1 no decepciona. Con WiFi 7 tribanda y Bluetooth 5.4, podrás disfrutar de conexiones rápidas y estables. Además, cuenta con múltiples puertos, incluyendo 2x Thunderbolt 4, 1x HDMI 2.1 y 2x USB 5Gbps Type-A, lo que te permite conectar fácilmente tus dispositivos y accesorios.

El diseño del ultrabook es elegante y funcional, con un acabado en gris que le da un toque moderno. Con dimensiones de 314 x 224 x 20 mm y un peso de solo 1550 g, es lo suficientemente ligero como para llevarlo contigo a cualquier lugar. La batería de 5Wh con carga rápida ExpressCharge Boost asegura que puedas trabajar durante horas sin preocuparte por la carga.

El Dell Pro Plus 14 2 en 1 también incluye una cámara frontal Quad HD de 5.2 MP y un sistema de audio de alta calidad con altavoces Cirrus Logic, lo que lo convierte en una excelente opción para videoconferencias y entretenimiento. Con el sistema operativo Microsoft Windows® 11 Pro, tendrás acceso a las últimas características y actualizaciones de seguridad.

Con una garantía de 1 año, el Dell Ultrabook Pro Plus 14 2 en 1 es la elección perfecta para quienes buscan un dispositivo potente, portátil y versátil. Ya sea para trabajar, estudiar o disfrutar de tu contenido favorito, este ultrabook está diseñado para superar tus expectativas.',
'{"RAM": "32 GB LPDDR5X (8533 MHz)", "Audio": "2 altavoces 2.5W, doble micrófono", "Marca": "Dell", "Pantalla": "14.0\" LED (1920x1200) táctil / 60 Hz", "Procesador": "Pro Plus 14 2 in 1", "Cámara Web": "Cámara frontal Quad HD 5.2MP IR", "Almacenamiento": "SSD 1TB", "Frecuencia CPU": "2.2 GHz", "Tarjeta Gráfica": "Intel Arc Graphics 140V (Integrada)"}',
10, 'DISPONIBLE', 0, NOW(), NOW()),

(2, 'A14LPLA', 'Notebook Gamer HP Victus Ryzen 7 8845HS RAM 16GB SSD 1TB 15.6" RTX4050 6GB W11H', 'notebook-gamer-hp-victus-ryzen-7-8845hs-ram-16gb-ssd-1tb-156-rtx4050-6gb-w11h',
'La Notebook Gamer HP Victus 15-FB2019LA es la elección perfecta para los entusiastas de los videojuegos que buscan un rendimiento excepcional y una experiencia visual envolvente. Equipado con un potente procesador AMD Ryzen™ 7 8845HS, que cuenta con 8 núcleos y 16 hilos, esta laptop ofrece una frecuencia base de 3.8 GHz y puede alcanzar hasta 5.1 GHz en modo turbo, garantizando un rendimiento fluido incluso en las tareas más exigentes.

La memoria RAM de 16 GB DDR5 a 5600 MHz permite una multitarea sin interrupciones, mientras que el almacenamiento SSD de 1 TB proporciona un acceso rápido a tus juegos y aplicaciones, reduciendo los tiempos de carga y mejorando la eficiencia general del sistema. Con una pantalla de 15.6 pulgadas y resolución Full HD (1920 x 1080), disfrutarás de gráficos nítidos y colores vibrantes, gracias a su tecnología IPS y un brillo de 300 nits.

La tarjeta gráfica NVIDIA GeForce RTX 4050 con 6 GB de memoria GDDR6 dedicada asegura que puedas jugar a los títulos más recientes con configuraciones gráficas altas, ofreciendo una experiencia de juego fluida y envolvente. Además, la laptop cuenta con una tasa de refresco de 144 Hz, lo que mejora la jugabilidad en títulos de acción rápida.

En términos de conectividad, la HP Victus está equipada con una variedad de puertos, incluyendo 2 puertos USB Type-A, 1 puerto USB Type-C con soporte para DisplayPort, 1 puerto HDMI 2.1 y un puerto RJ-45 para conexión de red. También incluye conectividad inalámbrica avanzada con Wi-Fi 6E y Bluetooth 5.3, asegurando que estés siempre conectado.

El diseño de la laptop es elegante y funcional, con un teclado retroiluminado de tamaño completo que incluye un teclado numérico, ideal para largas sesiones de juego. La batería de polímero de litio de 4 celdas ofrece una capacidad de 70 Wh, proporcionando una autonomía de hasta 7.75 horas, lo que te permite jugar y trabajar sin preocuparte por la carga.

Con un peso de solo 2.29 kg y dimensiones compactas de 358 x 255 x 24 mm, la HP Victus es fácil de transportar, lo que la convierte en una opción ideal para gamers en movimiento. Además, cuenta con un sistema de audio DTS:X Ultra y altavoces duales que mejoran la experiencia de inmersión en tus juegos y películas.

La Notebook Gamer HP Victus 15-FB2019LA no solo es una máquina potente, sino que también está diseñada con la sostenibilidad en mente, cumpliendo con certificaciones como EPEAT Gold y ENERGY STAR. Con su combinación de rendimiento, portabilidad y características avanzadas, esta laptop es una opción excepcional para cualquier gamer que busque llevar su experiencia de juego al siguiente nivel.',
'{"RAM": "16GB", "Procesador": "Ryzen 7", "Almacenamiento": "1TB", "Sistema Operativo": "Windows 11 Home", "Tamaño de pantalla ": "15.6"}',
20, 'DISPONIBLE', 0, NOW(), NOW()),

(3, 'C2NM9LT', 'Notebook Workstation HP ZBook X G1i Ultra 7 255HX RAM32GB SSD1TB 16" W11P', 'notebook-workstation-hp-zbook-x-g1i-ultra-7-255hx-ram32gb-ssd1tb-16-w11p',
'La Notebook Workstation HP ZBook X G1i es una potente herramienta diseñada para profesionales que requieren un rendimiento excepcional en sus tareas diarias. Con un procesador Intel® Core™ Ultra 7 255HX, que cuenta con 20 núcleos (8 de rendimiento y 12 de eficiencia), esta workstation es capaz de manejar múltiples aplicaciones y procesos simultáneamente, garantizando una experiencia fluida y eficiente. Su frecuencia base de 2.3 GHz puede alcanzar hasta 5.2 GHz en modo turbo, lo que la convierte en una opción ideal para trabajos que demandan alta capacidad de procesamiento.

Equipado con 32 GB de RAM DDR5 a 5600 MT/s, el HP ZBook X G1i asegura un rendimiento ágil y rápido, permitiendo a los usuarios ejecutar aplicaciones pesadas y realizar multitasking sin inconvenientes. Además, su almacenamiento SSD de 1 TB proporciona una velocidad de lectura y escritura de 500 MB/s, lo que se traduce en tiempos de carga reducidos y un acceso rápido a los datos.

La pantalla de 16 pulgadas con resolución WUXGA (1920 x 1200) ofrece imágenes nítidas y vibrantes, gracias a su tecnología IPS y un brillo de 300 nits. Esta característica es especialmente útil para diseñadores gráficos, editores de video y otros profesionales creativos que requieren precisión en los colores y detalles. La pantalla antirreflectante también permite trabajar en diversas condiciones de iluminación sin distracciones.

En términos de conectividad, la HP ZBook X G1i no decepciona. Dispone de múltiples puertos, incluyendo 2 puertos Thunderbolt 4, 2 puertos USB 5Gbps Type-A, 1 HDMI 2.1 y un puerto RJ45 para conexiones de red rápidas y estables. Además, cuenta con la última tecnología de Wi-Fi 7 (802.11be) y Bluetooth 5.4, asegurando que siempre estés conectado de manera eficiente.

La batería de polímero de litio de 6 celdas y 83 Wh proporciona una duración prolongada, ideal para aquellos que necesitan trabajar en movimiento. Con la capacidad de carga rápida, puedes obtener hasta un 50% de carga en solo 30 minutos, lo que es perfecto para días ajetreados.

El diseño del HP ZBook X G1i es elegante y funcional, con un teclado retroiluminado resistente a salpicaduras que incluye un teclado numérico, lo que facilita la entrada de datos. Además, la presencia de un lector de huellas digitales y opciones de protección mediante contraseña garantizan la seguridad de tus datos y proyectos.

Con un peso de aproximadamente 2.04 kg y dimensiones compactas de 359 x 230 x 23 mm, esta workstation es lo suficientemente portátil para llevarla a cualquier lugar, sin sacrificar el rendimiento. La HP ZBook X G1i es, sin duda, una opción excepcional para aquellos que buscan una computadora portátil potente y confiable para sus necesidades profesionales.',
'{"RAM": "32GB", "Procesador": "Ultra 7", "Almacenamiento": "1TB", "Sistema operativo": "Windows 11 Pro", "Tamaño de pantalla": "16"}',
20, 'DISPONIBLE', 0, NOW(), NOW());

-- ── PC de escritorio ────────────────────────────────────────────

INSERT INTO productos (id, sku, nombre, slug, descripcion, specs, stock, estado, version, created_at, updated_at)
VALUES
(4, 'F0JN0021CL', 'All-In-One Lenovo IdeaCentre A100, 23.8" FHD, Intel Core I3-N305, 8GB DDR4, SSD 512GB, W11 Home', 'all-in-one-lenovo-ideacentre-a100-238-fhd-intel-core-i3-n305-8gb-ddr4-ssd-512gb-w11-home',
'El Lenovo IdeaCentre A100 (F0JN0021CL) es un computador All-in-One de 23,8 pulgadas que integra pantalla, procesamiento y almacenamiento en un diseño compacto, reduciendo el espacio ocupado sobre el escritorio. Está equipado con un procesador Intel® Core™ i3-N305, 8 GB de memoria DDR4 y una unidad SSD de 512 GB, ofreciendo un funcionamiento ágil para tareas de productividad, navegación y aplicaciones de oficina.

Cuenta con una pantalla Full HD de 23,8 pulgadas que proporciona imágenes nítidas y un amplio espacio de visualización. Incorpora gráficos Intel® UHD Graphics, sistema operativo Windows 11 Home y un diseño en color Cloud Grey, complementado con teclado y mouse para disponer de una solución lista para utilizar desde el primer momento.',
'{"Color": "Cloud Grey", "Marca": "Lenovo", "Modelo": "IdeaCentre A100", "Pantalla": "23,8 pulgadas", "Gráficos": "Intel® UHD Graphics", "Procesador": "Intel® Core™ i3-N305", "Memoria RAM": "8 GB DDR4", "Resolución": "Full HD", "Almacenamiento": "SSD 512 GB", "Sistema operativo": "Windows 11 Home", "Idioma del teclado": "Español", "Periféricos incluidos": "Teclado y mouse", "Frecuencia del procesador": "Hasta 3,8 GHz"}',
20, 'DISPONIBLE', 0, NOW(), NOW()),

(5, 'SPLABS-CODE5-FDOS', 'PC Armado Code 5 , Ryzen 5 5600GT, 8GB RAM DDR4 3200 MHz, SSD NVMe 500 GB, 650w, FREEDOS', 'pc-armado-code-5-ryzen-5-5600gt-8gb-ram-ddr4-3200-mhz-ssd-nvme-500-gb-650w-freedos',
'Diseñado para ofrecer fluidez y fiabilidad en cada tarea. Equilibrio perfecto para gestionar trabajos de oficina y entretenimiento multimedia sin interrupciones. Es la herramienta ideal para un día a día eficiente, garantizando una experiencia rápida y sin tiempos de espera',
'{"Gabinete": "MSI PRO SHIELD M100P", "Procesador": "AMD Ryzen 5 5600GT", "Memoria RAM": "DDR4 8 GB 3200 MHz CL22", "Placa Madre": "GIGABYTE A520M K V2, Socket AM4", "Almacenamiento": "SSD ADATA LEGEND 860 500 GB", "Fuente de Poder": "Be Quiet! SYSTEM POWER 11U, 650 W"}',
10, 'DISPONIBLE', 0, NOW(), NOW()),

(6, 'TS-873A-8G-US', 'Servidor NAS QNAP AMD Ryzen™ V1500B, 4 Núcleos 2.2GHz, 8-Bay, 8GB Ram', 'servidor-nas-qnap-amd-ryzen-v1500b-4-nucleos-22ghz-8-bay-8gb-ram',
E'Medios de almacenaje\nUnidades de almacenamiento instaladas\tNo\nNúmero de unidades de almacenamiento compatibles\t8\nTipo de unidades de almacenamiento instaladas\tNo\nTipos de unidades de almacenamiento admitidas\tHDD & SSD\nCompatibilidad con RAID\tSi\nInterfaces de disco de almacenamiento soportados\tM.2, Serial ATA II, Serial ATA III\nTamaños de almacenamiento en disco soportados\t2.5,3.5,M.2\nNúmero de ranuras M.2 (M y B)\t2\nNiveles RAID\t0,1,5+S,5,6,6+HS,10+HS,10,50,60,JBOD\nMigración del nivel RAID online\tSi\nAmpliación RAID online\tSi',
'{"Memoria interna": "8 GB", "Familia de procesador": "AMD Ryzen", "Modelo del procesador": "V1500B", "RAM máximo soportado": "64 GB", "Tipo de memoria interna": "DDR4", "Frecuencia del procesador": "2,2 GHz", "Número de núcleos de procesador": "4", "Número de procesadores soportados": "1"}',
5, 'DISPONIBLE', 0, NOW(), NOW());

-- ── Componentes PC ──────────────────────────────────────────────

INSERT INTO productos (id, sku, nombre, slug, descripcion, specs, stock, estado, version, created_at, updated_at)
VALUES
(7, 'BX8071512400', 'Procesador Intel Core i5-12400, 2.5GHz Turbo 4.4GHz, Socket LGA 1700, 6-Core / 12-Threads', 'procesador-intel-core-i5-12400-25ghz-turbo-44ghz-socket-lga-1700-6-core-12-threads',
E'Procesador\nFamilia de procesador\tIntel® Core™ i5\nNúmero de núcleos de procesador\t6\nSocket de procesador\tLGA 1700\nCaja\tSi\nRefrigerador incluido\tSi\nFabricante de procesador\tIntel\nModelo del procesador\ti5-12400\nModo de procesador operativo\t64 bits\nProcessor generation\tIntel® Core™ i5 de 12ma Generación\nNúmero de hilos de ejecución\t12\nNúcleos de rendimiento\t6\nFrecuencia del procesador turbo\t4,4 GHz\nFrecuencia de aceleración de núcleo de rendimiento\t4,4 GHz\nFrecuencia base de núcleo de rendimiento\t2,5 GHz\nCaché del procesador\t18 MB\nTipo de cache en procesador\tSmart Cache\nPotencia base del procesador\t65 W\nPotencia turbo máxima\t117 W\nTipos de bus\tDMI4\nNúmero máximo de carriles DMI\t8\nAncho de banda de memoria soportada por el procesador (max)\t76,8 GB/s\nProcesador nombre en clave\tAlder Lake\nMemoria\nCanales de memoria\tDual-channel\nMemoria interna máxima que admite el procesador\t128 GB\nTipos de memoria que admite el procesador\tDDR4-SDRAM,DDR5-SDRAM\nAncho de banda de memoria (max)\t76,8 GB/s\nGráficos\nAdaptador gráfico incorporado\tSi\nAdaptador de gráficos discreto\tNo\nModelo de adaptador gráfico incorporado\tIntel UHD Graphics 730\nModelo de adaptador de gráficos discretos\tNo disponible\nSalidas compatibles de adaptador gráfico incorporado\tEmbedded DisplayPort (eDP) 1.4b,DisplayPort 1.4a,HDMI 2.1\nFrecuencia base de gráficos incorporada\t300 MHz\nFrecuencia dinámica (máx) de adaptador gráfico incorporado\t1450 MHz\nNúmero de pantallas soportadas (gráficos incorporados)\t4\nVersión DirectX de adaptador gráfico incorporado\t12.0\nVersión OpenGL de adaptador gráfico incorporado\t4.5\nResolución máxima de adaptador gráfico incorporado (DisplayPort)\t7680 x 4320 Pixeles\nResolución máxima de adaptador gráfico incorporado (eDP - Integrated Flat Panel)\t5120 x 3200 Pixeles\nResolución máxima de adaptador gráfico incorporado (HDMI)\t4096 x 2160 Pixeles\nFrecuencia de actualización de adaptador gráfico incorporado a la resolución máxima (DisplayPort)\t60 Hz',
'{"Marca": "Intel", "L3 Cache": "18", "Número Modelo": "BX8071512400", "Número de Cores": "6-Core", "Número de Threads": "12", "Gráficos Integrados": "Sí", "Socket del Procesador": "LGA 1700", "Procesador Desbloqueado": "No", "Frecuencia Base del Procesador": "2.5GHz", "Frecuencia Turbo del Procesador": "4.4GHz"}',
20, 'DISPONIBLE', 0, NOW(), NOW()),

(8, 'KF432C16BB2A/8', 'Memoria RAM DDR4 8GB 3200MT/s Kingston Fury Beast RGB, CL16, DIMM, 1.35V', 'memoria-ram-ddr4-8gb-3200mts-kingston-fury-beast-rgb-cl16-dimm-135v',
E'Un módulo de memoria DDR SDRAM transfiere datos en la subida y bajada de cada ciclo de reloj (1 Hz). Ej.: DDR4-3200 (PC4-3200) Frecuencia de reloj: 1600MHz Velocidad de transmisión de datos: 3200MT/seg Ancho de banda: 25,600 Mb/seg (25.6 GB/seg) \n\n1. Iluminación personalizable con el software Kingston FURY CTRL o con el software de control RGB de la placa madre El soporte para la personalización de RGB a través de software de otros fabricantes puede variar. \n\n2. La memoria Plug N Play trabajará en los sistemas DDR4 a la velocidad permitida por el BIOS del Fabricante. PnP no puede aumentar la velocidad de la memoria del sistema por encima de la velocidad permitida por el BIOS del Fabricante. Los productos FURY Plug N Play DDR4 soportan especificaciones XMP 2.0, por lo tanto, es posible lograr el overclocking activando el perfil incorporado XMP.\nCapacidad total: 8 GB (1x8 GB)\nPerfil de memoria: 3200MT/s 16-18-18 1.35V\nNúmero de pieza: KF432C16BB2A/8',
'{"Latencia CAS": "16", "Componente para": "PC/servidor", "Memoria interna": "8 GB", "Voltaje de memoria": "1.35 V", "Tiempo activo en fila": "32 ns", "Tiempo de ciclo de fila": "45,75 ns", "Tipo de memoria interna": "DDR4", "Configuración de módulos": "1024M x 64", "Forma de factor de memoria": "288-pin DIMM", "Velocidad de memoria del reloj": "3200 MHz", "Intel® Extreme Memory Profile (XMP)": "Si", "Tiempo de actualización de ciclo de fila": "350 ns"}',
20, 'DISPONIBLE', 0, NOW(), NOW()),

(9, '912-V537-038', 'Tarjeta de Video MSI NVIDIA GeForce RTX 5060 SHADOW 2X OC, 8GB GDDR7, 128-bit, PCI-e 5.0', 'tarjeta-de-video-msi-nvidia-geforce-rtx-5060-shadow-2x-oc-8gb-gddr7-128-bit-pci-e-50',
E'GeForce RTX™ 5060 8G SHADOW 2X OC\nBasada en la arquitectura NVIDIA Blackwell y DLSS 4\nTarjeta GeForce Enthusiast preparada para SFF\nRelojes de núcleo:\nRendimiento extremo: 2535 MHz (MSI Center)\nBoost: 2527 MHz\nTORX FAN 5.0: Las aspas del ventilador unidas por arcos anulares trabajan para estabilizar y mantener el flujo de aire a alta presión.\nTubos de Calor: diseñados para una transferencia de calor eficiente, los tubos de calor alejan eficazmente la energía térmica de la GPU, mejorando el rendimiento general de la refrigeración.\nBackplate de Refuerzo: La placa trasera de refuerzo incorpora una rejilla de ventilación que permite el paso directo del aire de escape.\nMSI Center: El exclusivo software MSI Center permite monitorizar, ajustar y optimizar los productos MSI en tiempo real.\nEl software Afterburner toma el control total con el software de overclocking de tarjetas gráficas más reconocido y utilizado del mundo.',
'{"Cores": "3840 Units", "Memory": "8GB GDDR7", "Memory Bus": "128-bit", "Model Name": "G5060-8S2C", "Bus Standard": "PCI Express® Gen 5 x16 (uses x8)", "Motor Gráfico": "NVIDIA® GeForce RTX™ 5060", "Recommended PSU": "550 W", "Power connectors": "8-pin x 1", "Card Dimension (mm)": "197 x 120 x 40 mm"}',
30, 'DISPONIBLE', 0, NOW(), NOW()),

(10, 'WDBBYV0010BNC-WRWM', 'Unidad SSD Sandisk WD_BLACK SN850P NVMe, 1TB, Lectura 7300 MBs, Escritura 6300 MBs, Licencia PS5', 'unidad-ssd-sandisk-wdblack-sn850p-nvme-1tb-lectura-7300-mbs-escritura-6300-mbs-licencia-ps5',
E'El SSD SanDisk WD_BLACK SN850P NVMe para consolas PS5 de 1 TB (WDBBYV0010BNC-WRSN) es una unidad de almacenamiento interno M.2 NVMe PCIe 4.0 x4 con formato M.2 2280. Cuenta con capacidad de 1 TB, rendimiento de lectura secuencial de hasta 7300 MB/s, escritura secuencial de hasta 6300 MB/s, además de disipador térmico integrado.\n\nEl modelo incorpora interfaz PCIe 4.0 x4, conector M.2, lectura aleatoria de hasta 800K IOPS, escritura aleatoria de hasta 1100K IOPS, dimensiones de 80 × 24,46 × 9,89 mm y peso de 30,4 g.',
'{"Peso": "30,4 g", "Tipo": "Unidad SSD interna NVMe", "Marca": "SanDisk", "Formato": "M.2 2280", "Conector": "M.2", "Interfaz": "PCIe 4.0 x4", "Capacidad": "1 TB", "Dimensiones": "80 × 24,46 × 9,89 mm", "Lectura aleatoria": "Hasta 800K IOPS", "Resistencia (TBW)": "600 TBW", "Lectura secuencial": "Hasta 7300 MB/s", "Escritura aleatoria": "Hasta 1100K IOPS", "Escritura secuencial": "Hasta 6300 MB/s"}',
10, 'DISPONIBLE', 0, NOW(), NOW());

-- 3. INSERCIÓN DE IMÁGENES
-- IDs secuenciales desde 1. La columna 'principal' indica la imagen principal del producto.
INSERT INTO producto_imagenes (id, producto_id, url, principal)
VALUES
-- Producto 1 (Dell Ultrabook)
(1, 1, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/2uao9ivfd3uzw8b8q433ffrmh929?_a=BACCd2Ev', true),
(2, 1, 'https://media.spdigital.cl/thumbnails/products/1756737149160-U7LNL321TBWPS-02_e3e31969_05faaa94_thumbnail_512.jpg', false),
(3, 1, 'https://media.spdigital.cl/thumbnails/products/1756737161926-U7LNL321TBWPS-06_aa48972b_b23647b7_thumbnail_4096.jpg', false),
-- Producto 2 (HP Victus Gaming)
(4, 2, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/ij1yd3s3dmjwa5ozwfes75m8dhd0?_a=BACCd2Ev', true),
(5, 2, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/rbjveemb2kkfqzlfvd8tp6mhbywa?_a=BACCd2Ev', false),
(6, 2, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/eaw9r90ikafg2713fqlbq8szgj6u?_a=BACCd2Ev', false),
-- Producto 3 (HP ZBook Workstation)
(7, 3, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/gh10i3duy6896vl51ij5ws5zcn34?_a=BACCd2Ev', true),
(8, 3, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/jb8clvuqhcfzx0qch47hkvas16q5?_a=BACCd2Ev', false),
(9, 3, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/lvlmnj20eoryz8ivohztt3ynyjko?_a=BACCd2Ev', false),
-- Producto 4 (Lenovo All-In-One)
(10, 4, 'https://media.spdigital.cl/thumbnails/products/1786031283067-A100a_60178bc9_5a8f1ff1_thumbnail_512.jpg', true),
(11, 4, 'https://media.spdigital.cl/thumbnails/products/1786031295715-A100c_36eb0932_f86e790e_thumbnail_512.jpg', false),
(12, 4, 'https://media.spdigital.cl/thumbnails/products/1786031289018-A100b_ac383ac1_6a53e233_thumbnail_512.jpg', false),
-- Producto 5 (PC Armado Code 5)
(13, 5, 'https://media.spdigital.cl/thumbnails/products/1787242207044-Thumbnail_L_Tasking_06ff7355_332ac68d_thumbnail_512.jpg', true),
(14, 5, 'https://media.spdigital.cl/thumbnails/products/1787242209338-Thumbnail_L_Tasking_2eb22f84_9a19dfdd_thumbnail_512.jpg', false),
-- Producto 6 (NAS QNAP)
(15, 6, 'https://media.spdigital.cl/thumbnails/products/orapl0ln_a8efdbc4_thumbnail_512.jpg', true),
(16, 6, 'https://media.spdigital.cl/thumbnails/products/nhcaikxz_9bea5f08_thumbnail_512.jpg', false),
(17, 6, 'https://media.spdigital.cl/thumbnails/products/n6fgqxvr_bfe953bb_thumbnail_512.jpg', false),
-- Producto 7 (Intel i5-12400)
(18, 7, 'https://media.spdigital.cl/thumbnails/products/ijr8slav_42e15bcb_thumbnail_512.jpeg', true),
(19, 7, 'https://media.spdigital.cl/thumbnails/products/xd67fbsj_3b46b84a_thumbnail_512.jpg', false),
(20, 7, 'https://media.spdigital.cl/thumbnails/products/cpuntdj7_1e750731_thumbnail_512.png', false),
-- Producto 8 (Kingston Fury Beast RGB)
(21, 8, 'https://media.spdigital.cl/thumbnails/products/icpdcgvy_b02983d1_thumbnail_512.jpg', true),
(22, 8, 'https://media.spdigital.cl/thumbnails/products/qt9kn18m_60055d57_thumbnail_512.jpg', false),
(23, 8, 'https://media.spdigital.cl/thumbnails/products/gia_spcr_ba722a1b_thumbnail_512.jpg', false),
-- Producto 9 (MSI RTX 5060)
(24, 9, 'https://media.spdigital.cl/thumbnails/products/1760967019645-c8_76e05a3a_cfd6dc5c_thumbnail_512.png', true),
(25, 9, 'https://media.spdigital.cl/thumbnails/products/1761257748783-g1_ad9e70e6_e2cc3414_thumbnail_512.png', false),
(26, 9, 'https://media.spdigital.cl/thumbnails/products/1761257752996-g2_a54a6acc_23a73ff2_thumbnail_512.png', false),
-- Producto 10 (WD_BLACK SN850P)
(27, 10, 'https://media.spdigital.cl/thumbnails/products/1783633157059-wd1_e4ca1a79_c563ea07_thumbnail_512.jpg', true),
(28, 10, 'https://media.spdigital.cl/thumbnails/products/1783633170661-wd5_98b40dfa_e509d402_thumbnail_512.jpg', false),
(29, 10, 'https://media.spdigital.cl/thumbnails/products/1783633323273-wd3_5694e891_1c336599_thumbnail_512.jpg', false);

-- 4. INSERCIÓN DE PRECIOS VIGENTES
-- Se inserta SOLO el precio actual (fecha_fin NULL) para evitar historial innecesario en el seed.
INSERT INTO precio_historial (producto_id, precio_venta, precio_costo, moneda, fecha_inicio, fecha_fin)
VALUES
(1, 1900.00, 1900.00, 'USD', NOW(), NULL),
(2,  999.00,  999.00, 'USD', NOW(), NULL),
(3, 2199.00, 2199.00, 'USD', NOW(), NULL),
(4,  649.00,  649.00, 'USD', NOW(), NULL),
(5,  499.00,  499.00, 'USD', NOW(), NULL),
(6, 1820.00, 1820.00, 'USD', NOW(), NULL),
(7,  210.00,  210.00, 'USD', NOW(), NULL),
(8,  125.00,  125.00, 'USD', NOW(), NULL),
(9,  430.00,  430.00, 'USD', NOW(), NULL),
(10, 400.00,  400.00, 'USD', NOW(), NULL);

-- 5. ASOCIACIÓN DE CATEGORÍAS
-- Vincula los productos con sus categorías respectivas.
-- Referencia de categorías:
--   1=Computación, 3=Gaming, 7=Laptops y portátiles, 8=PC de escritorio,
--   9=Componentes PC, 13=Consolas, 25=Gaming Laptop, 26=Ultrabooks,
--   27=Workstations, 28=All-in-One, 29=Torres/MiniPC, 30=Servidores NAS,
--   31=Procesadores, 32=RAM, 33=Tarjetas gráficas, 34=Almacenamiento
INSERT INTO producto_categorias (producto_id, categoria_id)
VALUES
-- Producto 1 (Dell Ultrabook) → Computación > Laptops > Ultrabooks
(1, 1), (1, 7), (1, 26),
-- Producto 2 (HP Victus Gaming) → Computación > Laptops > Gaming Laptop + Gaming > Consolas
(2, 1), (2, 3), (2, 7), (2, 13), (2, 25),
-- Producto 3 (HP ZBook Workstation) → Computación > Laptops > Workstations
(3, 1), (3, 7), (3, 27),
-- Producto 4 (Lenovo All-In-One) → Computación > PC escritorio > All-in-One
(4, 1), (4, 8), (4, 28),
-- Producto 5 (PC Armado Code 5) → Computación > PC escritorio > Torres/MiniPC
(5, 1), (5, 8), (5, 29),
-- Producto 6 (NAS QNAP) → Computación > PC escritorio > Servidores NAS
(6, 1), (6, 8), (6, 30),
-- Producto 7 (Intel i5-12400) → Computación > Componentes PC > Procesadores
(7, 1), (7, 9), (7, 31),
-- Producto 8 (Kingston Fury Beast RGB) → Computación > Componentes PC > RAM
(8, 1), (8, 9), (8, 32),
-- Producto 9 (MSI RTX 5060) → Computación > Componentes PC > Tarjetas gráficas
(9, 1), (9, 9), (9, 33),
-- Producto 10 (WD_BLACK SN850P) → Computación > Componentes PC > Almacenamiento
(10, 1), (10, 9), (10, 34);

-- 6. REINICIO DE SECUENCIAS
-- CRÍTICO: Ajusta las secuencias para que el próximo ID automático sea el correcto.
-- Esto evita errores de "duplicate key" al crear nuevos productos desde la aplicación.

-- Secuencia de Productos (último ID: 10, siguiente será 11)
SELECT setval('productos_id_seq', (SELECT MAX(id) FROM productos));

-- Secuencia de Imágenes (último ID: 29, siguiente será 30)
SELECT setval('producto_imagenes_id_seq', (SELECT MAX(id) FROM producto_imagenes));

-- Secuencia de Precios (si usa secuencia propia)
-- SELECT setval('precio_historial_id_seq', (SELECT MAX(id) FROM precio_historial));

-- Fin del script