package com.jeplabs.ecommerce.infra.springdoc;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringDocConfigurations {

    // Define el esquema de autenticación Bearer JWT
    // Esto agrega el botón "Authorize" en Swagger UI
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("JPE Labs E-commerce API")
                        .version("1.0.0")
                        .description("API REST para gestión de productos, categorías y usuarios")
                        .contact(new Contact()
                                .name("JPE Labs")
                                .email("contacto@jpelabs.com")))

                // Registra el esquema de seguridad llamado "bearerAuth"
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")         // tipo Bearer
                                        .bearerFormat("JWT")      // formato JWT
                                        .description("Ingresa tu JWT token. Obtenlo en POST /api/auth/login")))

                // Aplica bearerAuth globalmente a todos los endpoints
                .addSecurityItem(new SecurityRequirement()
                        .addList("bearerAuth"));
    }
}