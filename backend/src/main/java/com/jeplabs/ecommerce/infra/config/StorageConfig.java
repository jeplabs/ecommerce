package com.jeplabs.ecommerce.infra.config;

import com.jeplabs.ecommerce.infra.storage.*;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StorageConfig {

    @Value("${api.storage.provider}")
    private String provider;

    @Bean
    public StorageService storageService(
            @Qualifier("localStorageService") StorageService local,
            @Qualifier("cloudinaryStorageService") StorageService cloudinary) {
        return switch (provider) {
            case "cloudinary" -> cloudinary;
            default          -> local;
        };
    }
}