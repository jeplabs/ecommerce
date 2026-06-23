package com.jeplabs.ecommerce.infra.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Component
public class ArchivoValidator {

    @Value("${api.storage.allowed-types}")
    private String allowedTypes;

    @Value("${api.storage.max-size-mb}")
    private long maxSizeMb;

    public void validar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo no puede estar vacío");
        }

        List<String> tiposPermitidos = Arrays.asList(allowedTypes.split(","));
        if (!tiposPermitidos.contains(archivo.getContentType())) {
            throw new IllegalArgumentException(
                    "Tipo de archivo no permitido. Solo se aceptan: PNG, JPG y PDF");
        }

        long maxBytes = maxSizeMb * 1024 * 1024;
        if (archivo.getSize() > maxBytes) {
            throw new IllegalArgumentException(
                    "El archivo excede el tamaño máximo permitido de " + maxSizeMb + "MB");
        }
    }
}