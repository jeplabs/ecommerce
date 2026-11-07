-- 3. INSERCIÓN DE IMÁGENES
-- IDs secuenciales desde 1. La columna 'principal' indica la imagen principal del producto.
-- Nota: Solo los productos 1 al 10 cuentan con registros de imágenes precargados.
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

-- 6. REINICIO DE SECUENCIAS
-- CRÍTICO: Ajusta las secuencias para que el próximo ID automático sea el correcto.
-- Esto evita errores de "duplicate key" al crear nuevos productos desde la aplicación.

-- Secuencia de Productos (último ID: 560, siguiente será 561)
-- (Ejecutado en V4__seed_productos_dev.sql)

-- Secuencia de Imágenes (último ID: 29, siguiente será 30)
SELECT setval('producto_imagenes_id_seq', (SELECT MAX(id) FROM producto_imagenes));

-- Secuencia de Precios (si usa secuencia propia)
-- SELECT setval('precio_historial_id_seq', (SELECT MAX(id) FROM precio_historial));

-- Fin del script
