package com.jeplabs.ecommerce.infra.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Intercepta cada request y valida el token
@Component
@RequiredArgsConstructor
public class FiltroSeguridad extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UsuarioDetailsService usuarioDetailsService; //Inyeccion de UsuarioDetailsService

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.replace("Bearer ", "");
            try {
                String email = tokenService.getSubject(token);
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails usuario = usuarioDetailsService.loadUserByUsername(email);
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            usuario, null, usuario.getAuthorities()
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                // Si el token es inválido o expiró, nos aseguramos de que el contexto esté limpio.
                // No relanzamos la excepción para que el filtro de seguridad de Spring
                // invoque JwtAuthenticationEntryPoint (HTTP 401) en endpoints que requieren autenticación.
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}