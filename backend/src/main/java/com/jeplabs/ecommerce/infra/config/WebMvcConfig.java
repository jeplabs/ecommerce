package com.jeplabs.ecommerce.infra.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${api.storage.local.path:uploads}")
    private String basePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get(basePath);
        String uploadAbsolutePath = uploadDir.toFile().getAbsolutePath();

        registry.addResourceHandler("/" + basePath + "/**", "/uploads/**")
                .addResourceLocations("file:" + uploadAbsolutePath + "/");
    }
}
