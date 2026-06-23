package com.jeplabs.ecommerce.infra.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service("cloudinaryStorageService")
public class CloudinaryStorageService implements StorageService {

    @Value("${api.storage.cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${api.storage.cloudinary.api-key:}")
    private String apiKey;

    @Value("${api.storage.cloudinary.api-secret:}")
    private String apiSecret;

    @Override
    public String guardar(MultipartFile archivo, String carpeta) {
        // Implementar cuando tengas credenciales de Cloudinary
        // Dependencia a agregar en pom.xml cuando esté listo:
        // <dependency>
        //     <groupId>com.cloudinary</groupId>
        //     <artifactId>cloudinary-http44</artifactId>
        //     <version>1.38.0</version>
        // </dependency>
        //
        // Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
        //     "cloud_name", cloudName,
        //     "api_key", apiKey,
        //     "api_secret", apiSecret
        // ));
        // Map resultado = cloudinary.uploader().upload(archivo.getBytes(),
        //     ObjectUtils.asMap("folder", carpeta));
        // return (String) resultado.get("secure_url");
        throw new UnsupportedOperationException(
                "Cloudinary no está configurado aún. Agrega las credenciales en application.properties");
    }

    @Override
    public void eliminar(String url) {
        // cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        throw new UnsupportedOperationException("Cloudinary no está configurado aún");
    }
}