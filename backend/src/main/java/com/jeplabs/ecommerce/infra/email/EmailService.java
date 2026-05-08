package com.jeplabs.ecommerce.infra.email;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String emailOrigen;

    // @Async para no bloquear el hilo principal mientras se envía el email
    @Async
    public void enviarEmailCarritoAbandonado(String emailDestino, String nombreUsuario,
                                             long horasRestantes) {
        String asunto = "¿Olvidaste algo? Tu carrito expira pronto";
        String contenido = construirEmailCarrito(nombreUsuario, horasRestantes);
        enviar(emailDestino, asunto, contenido);
    }

    @Async
    public void enviarEmailCarritoVaciado(String emailDestino, String nombreUsuario) {
        String asunto = "Tu carrito ha sido vaciado";
        String contenido = """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Hola %s,</h2>
                    <p>Tu carrito de compras ha expirado y fue vaciado automáticamente.</p>
                    <p>Puedes volver a agregar tus productos cuando quieras.</p>
                    <br>
                    <p>¡Te esperamos!</p>
                </body>
                </html>
                """.formatted(nombreUsuario);
        enviar(emailDestino, asunto, contenido);
    }

    // Método privado reutilizable para enviar cualquier email
    private void enviar(String destino, String asunto, String contenido) {
        try {
            System.out.println("Intentando enviar email a: " + destino); // ← log temporal
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(emailOrigen);
            helper.setTo(destino);
            helper.setSubject(asunto);
            helper.setText(contenido, true); // true = HTML
            mailSender.send(mensaje);
            System.out.println("Email enviado exitosamente a: " + destino); // ← log temporal
        } catch (MessagingException e) {
            // Log del error sin interrumpir el flujo principal
            System.err.println("Error enviando email a " + destino + ": " + e.getMessage());
            e.printStackTrace(); // ← para ver el error completo
        }
    }

    private String construirEmailCarrito(String nombreUsuario, long horasRestantes) {
        return """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Hola %s,</h2>
                    <p>Tienes productos esperándote en tu carrito.</p>
                    <p>Tu carrito expirará en <strong>%d minutos</strong>.</p>
                    <p>Completa tu compra antes de que se vacíe automáticamente.</p>
                    <br>
                    <a href="http://localhost:5173/carrito"
                       style="background-color: #007bff; color: white;
                              padding: 10px 20px; text-decoration: none;
                              border-radius: 5px;">
                        Ver mi carrito
                    </a>
                    <br><br>
                    <p>¡Te esperamos!</p>
                </body>
                </html>
                """.formatted(nombreUsuario, horasRestantes);
    }
}
