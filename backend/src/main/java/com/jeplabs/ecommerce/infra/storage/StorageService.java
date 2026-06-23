package com.jeplabs.ecommerce.infra.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String guardar(MultipartFile archivo, String carpeta);
    void eliminar(String url);
}