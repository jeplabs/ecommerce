package com.jeplabs.ecommerce.infra.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service("cloudinaryStorageService")
public class CloudinaryStorageService implements StorageService {

    @Value("${api.storage.cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${api.storage.cloudinary.api-key:}")
    private String apiKey;

    @Value("${api.storage.cloudinary.api-secret:}")
    private String apiSecret;

    private Cloudinary getCloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key",    apiKey,
                "api_secret", apiSecret,
                "secure",     true
        ));
    }

    @Override
    public String guardar(MultipartFile archivo, String carpeta) {
        try {
            String publicId = carpeta + "/" + UUID.randomUUID();

            // Detectar si es PDF para subirlo como raw
            boolean esPdf = "application/pdf".equals(archivo.getContentType());

            Map<String, Object> opciones = esPdf
                    ? ObjectUtils.asMap(
                    "public_id",    publicId,
                    "resource_type","raw",   // ← PDFs como raw
                    "overwrite",    true)
                    : ObjectUtils.asMap(
                    "public_id",    publicId,
                    "resource_type","image", // ← imágenes como image
                    "overwrite",    true);

            Map resultado = getCloudinary().uploader()
                    .upload(archivo.getBytes(), opciones);

            return (String) resultado.get("secure_url");

        } catch (IOException e) {
            throw new RuntimeException(
                    "Error al subir archivo a Cloudinary: " + e.getMessage());
        }
    }

    @Override
    public void eliminar(String url) {
        try {
            // Extraer el public_id de la URL de Cloudinary
            // URL ejemplo: https://res.cloudinary.com/cloud/image/upload/v123/comprobantes/uuid
            String publicId = extraerPublicId(url);
            getCloudinary().uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException(
                    "Error al eliminar archivo de Cloudinary: " + e.getMessage());
        }
    }

    private String extraerPublicId(String url) {
        // Remover la extensión y extraer el path después de /upload/vXXX/
        String sinExtension = url.contains(".")
                ? url.substring(0, url.lastIndexOf("."))
                : url;
        int indiceUpload = sinExtension.indexOf("/upload/");
        if (indiceUpload == -1) return url;
        String despuesDeUpload = sinExtension.substring(indiceUpload + 8);
        // Remover la versión (v123456/)
        if (despuesDeUpload.startsWith("v") && despuesDeUpload.contains("/")) {
            despuesDeUpload = despuesDeUpload.substring(despuesDeUpload.indexOf("/") + 1);
        }
        return despuesDeUpload;
    }
}