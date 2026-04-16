export const extractFilterOptions = (productos) => {
    if (!productos || productos.length === 0) return {};

    const opciones = {
        marca: new Set(),
        ram: new Set(),
        almacenamiento: new Set(),
        estado: new Set(),
        precioMin: Infinity,
        precioMax: -Infinity
    };

    productos.forEach(prod => {
        // 1. Extraer Marca (si existe en specs o como campo propio)
        if (prod.specs?.Marca) opciones.marca.add(prod.specs.Marca);
        if (prod.marca) opciones.marca.add(prod.marca); // Por si acaso

        // 2. Extraer RAM (normalizar texto: "16 GB" -> "16GB")
        if (prod.specs?.RAM) {
            const ramNormalizada = prod.specs.RAM.toString().replace(/\s/g, '');
            opciones.ram.add(ramNormalizada);
        }

        // 3. Extraer Almacenamiento
        if (prod.specs?.Almacenamiento) {
            const storageNormalizada = prod.specs.Almacenamiento.toString().replace(/\s/g, '');
            opciones.almacenamiento.add(storageNormalizada);
        }

        // 4. Estado
        if (prod.estado) opciones.estado.add(prod.estado);

        // 5. Rango de Precios
        if (prod.precioVenta) {
            if (prod.precioVenta < opciones.precioMin) opciones.precioMin = prod.precioVenta;
            if (prod.precioVenta > opciones.precioMax) opciones.precioMax = prod.precioVenta;
        }
    });

    // Convertir Sets a Arrays ordenados
    return {
        marcas: Array.from(opciones.marca).sort(),
        rams: Array.from(opciones.ram).sort(),
        almacenamientos: Array.from(opciones.almacenamiento).sort(),
        estados: Array.from(opciones.estado).sort(),
        precioMin: opciones.precioMin === Infinity ? 0 : opciones.precioMin,
        precioMax: opciones.precioMax === -Infinity ? 1000 : opciones.precioMax
    };
};