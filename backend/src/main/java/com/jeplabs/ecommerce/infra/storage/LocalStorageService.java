package com.jeplabs.ecommerce.infra.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.UUID;

@Service("localStorageService")
public class LocalStorageService implements StorageService {

    @Value("${api.storage.local.path}")
    private String basePath;

    @Override
    public String guardar(MultipartFile archivo, String carpeta) {
        try {
            // Estructura: uploads/comprobantes/2026/06/uuid-filename
            LocalDate hoy = LocalDate.now();
            String subCarpeta = hoy.getYear() + "/" + String.format("%02d", hoy.getMonthValue());
            Path directorio = Paths.get(basePath, carpeta, subCarpeta);
            Files.createDirectories(directorio);

            String extension = obtenerExtension(archivo.getOriginalFilename());
            String nombreArchivo = UUID.randomUUID() + "." + extension;
            Path rutaArchivo = directorio.resolve(nombreArchivo);

            Files.copy(archivo.getInputStream(), rutaArchivo, StandardCopyOption.REPLACE_EXISTING);

            return "/" + basePath.replace("\\", "/") + "/" + carpeta + "/" + subCarpeta + "/" + nombreArchivo;

        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo: " + e.getMessage());
        }
    }

    @Override
    public void eliminar(String url) {
        try {
            Path archivo = Paths.get(url);
            Files.deleteIfExists(archivo);
        } catch (IOException e) {
            throw new RuntimeException("Error al eliminar el archivo: " + e.getMessage());
        }
    }

    private String obtenerExtension(String nombreArchivo) {
        if (nombreArchivo == null || !nombreArchivo.contains(".")) return "bin";
        return nombreArchivo.substring(nombreArchivo.lastIndexOf(".") + 1).toLowerCase();
    }
}