package com.jeplabs.ecommerce.infra.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// Configura Spring Security
// Desabilita CSRF (innecesario en APIs stateless
// Define que las sesiones no se guardan en servidor
// Indica cuáles endpoints son públicas y cuáles requieren autentificacion
// Las direcciones que aparecen allí son públicas no requieren token ni admin.
// Declara BCryptPasswordEncoder como bean para que Spring pueda inyectarlo
// Declara Authentication Manager como la encargada de validar la credenciales.
@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // habilita @PreAuthorize
@RequiredArgsConstructor
public class SecurityConfigurations {

    private final FiltroSeguridad filtroSeguridad; // Registra el filtro
    private final JwtAuthenticationEntryPoint authenticationEntryPoint; //
    private final JwtAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configure(http))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(req -> req
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        //.requestMatchers(HttpMethod.GET, "/api/auth/usuarios").permitAll()
                        .anyRequest().authenticated()
                )
                // Maneja los Handlers JwtAccessDenied y AuthenticationsEntryPoint
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint) // ← nuevo
                        .accessDeniedHandler(accessDeniedHandler)           // ← nuevo
                )
                .addFilterBefore(filtroSeguridad, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}