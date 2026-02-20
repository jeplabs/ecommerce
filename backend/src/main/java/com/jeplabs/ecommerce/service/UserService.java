package com.jeplabs.ecommerce.service;

import com.jeplabs.ecommerce.dto.AuthResponse;
import com.jeplabs.ecommerce.dto.RegisterRequest;
import com.jeplabs.ecommerce.entity.User;
import com.jeplabs.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // Marca esta clase como un componente de servicio gestionado por Spring
@RequiredArgsConstructor // Genera constructor con los campos 'final', permitiendo inyección de dependencias
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Registra un nuevo usuario en la base de datos
    // Verifica que el email no esté en uso, encripta la contraseña y guarda el usuario
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Encripta la contraseña antes de guardarla
                .role(request.getRole() != null ? request.getRole() : "USER") // Asigna rol USER por defecto
                .build();

        userRepository.save(user); // Persiste el usuario en la DB

        return new AuthResponse("Usuario registrado exitosamente", user.getEmail(), user.getRole());
    }

    // Autentica un usuario verificando email y contraseña
    // Retorna una respuesta con los datos del usuario si las credenciales son correctas
    public AuthResponse login(RegisterRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado")); // Lanza error si no existe el email

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta"); // Compara contraseña ingresada con el hash guardado
        }

        return new AuthResponse("Login exitoso", user.getEmail(), user.getRole());
    }

    // Retorna la lista completa de usuarios registrados en la DB
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Busca un usuario por su ID, lanza excepción si no existe
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario con id " + id + " no encontrado"));
    }

    // Elimina un usuario de la DB por su ID
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Usuario con id " + id + " no encontrado");
        }
        userRepository.deleteById(id);
    }
}