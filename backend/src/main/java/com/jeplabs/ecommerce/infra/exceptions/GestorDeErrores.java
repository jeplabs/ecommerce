package com.jeplabs.ecommerce.infra.exceptions;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

// Intercepta excepciones globalmente.
@RestControllerAdvice
public class GestorDeErrores {

    // MethodArgumentNotValidException es la excepcion que lanza todas las validaciones
    // incluyendo @NotBlank, @Size y @ValidPassword, y más.
    // Envía un JSON, por ejemplo:
    // {
    //    "password": "La contrasena debe tener al menos una mayúscula, un numero y un caracter especial",
    //    "confirmarPassword": "Las contraseñas no coinciden"
    // }
    // o
    // {
    //    "password": La contrasena debe tener al menos 8 caracteres | La contrasena debe tener al menos
    // una mayuscula, un numero y un caracter especial"
    // }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> manejarValidacion(
            MethodArgumentNotValidException ex) {
        Map<String, String> errores = ex.getBindingResult().getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        FieldError::getDefaultMessage,
                        (mensajeExistente, mensajeNuevo) -> mensajeExistente + " | " + mensajeNuevo
                ));

        return ResponseEntity.badRequest().body(errores);
    }

    // Maneja credenciales incorrectas en Login.
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> manejarCredencialesInvalidas(
            BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Email o contraseña incorrectos"));
    }

    // Devuelve un JSON con los campos inválidos, como email duplicado
    // Devuelve un JSON cuando no encuentra un usuario con un determinado ID
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> manejarIllegalArgument(
            IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    // Manejo para usuario desactivado, cuando active = false
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, String>> manejarUsuarioDesactivado(
            DisabledException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Tu cuenta ha sido desactivada, contacta al administrador"));
    }

    // Manejo de errores al enviar un JSON con error en su formato esperado, en registro usuarios.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> manejarJsonInvalido(
            HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "El JSON enviado tiene un error de formato, verifica que tenga comas, llaves y comillas correctas"));
    }

    // Manejo de errores al superar el numero de intentos de login
    @Value("${api.security.lockout-minutes}")
    private long lockoutMinutes; // lee el valor de application.properties

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<Map<String, String>> manejarCuentaBloqueada(
            LockedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Tu cuenta está bloqueada por demasiados intentos fallidos, intenta de nuevo en " + lockoutMinutes + " minutos"));
    }

// Capturar errores SQL de base de datos, de forma más clara.
    @ExceptionHandler(InvalidDataAccessResourceUsageException.class)
    public ResponseEntity<Map<String, String>> manejarErrorBD(
            InvalidDataAccessResourceUsageException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al ejecutar la consulta en la base de datos"));
    }

    // Handlers específicos para cada excepción con el código HTTP correcto
    @ExceptionHandler(CarritoVacioException.class)
    public ResponseEntity<Map<String, String>> manejarCarritoVacio(
            CarritoVacioException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(CarritoNoEncontradoException.class)
    public ResponseEntity<Map<String, String>> manejarCarritoNoEncontrado(
            CarritoNoEncontradoException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(OrdenNoEncontradaException.class)
    public ResponseEntity<Map<String, String>> manejarOrdenNoEncontrada(
            OrdenNoEncontradaException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND) // ← 404
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(ProductoNoDisponibleException.class)
    public ResponseEntity<Map<String, String>> manejarProductoNoDisponible(
            ProductoNoDisponibleException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(StockInsuficienteException.class)
    public ResponseEntity<Map<String, String>> manejarStockInsuficiente(
            StockInsuficienteException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(EstadoInvalidoException.class)
    public ResponseEntity<Map<String, String>> manejarEstadoInvalido(
            EstadoInvalidoException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", ex.getMessage()));
    }

    // Para que Spring convierta AccessDeniedException en 403 Forbidden, en vez de 500 Internal Server Error.
    // se usa para Test OrdenControllerTest.
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> manejarAccesoDenegado(
            org.springframework.security.access.AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Acceso denegado: no tienes permisos para realizar esta acción"));
    }

    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> manejarTamanoMaximoSuperado(
            org.springframework.web.multipart.MaxUploadSizeExceededException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "El archivo supera el tamaño máximo permitido de 5MB"));
    }

    @ExceptionHandler(java.util.NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> manejarNoSuchElement(
            java.util.NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage() != null ? ex.getMessage() : "Recurso no encontrado"));
    }
}