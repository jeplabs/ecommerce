INSERT INTO metodos_pago (codigo, nombre, descripcion, tipo, activo, orden_visualizacion)
VALUES ('QPAYPRO', 'QPayPro', 'Visa, Mastercard - Guatemala', 'PASARELA', true, 6)
ON CONFLICT (codigo) DO NOTHING;