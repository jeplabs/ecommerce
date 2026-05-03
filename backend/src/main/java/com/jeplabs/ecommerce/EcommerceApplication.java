package com.jeplabs.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

// @EnableJpaAuditing para que @CreatedDate y @LastModifiedDate funcionen
// @EnableSpringDataWebSupport serializa el Page en un formato estable y limpio, al listar productos.
@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling  //   habilita @Scheduled
@EnableAsync       //   habilita @Async para emails en segundo plano
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class EcommerceApplication {

	public static void main(String[] args) {
		SpringApplication.run(EcommerceApplication.class, args);
	}

}
