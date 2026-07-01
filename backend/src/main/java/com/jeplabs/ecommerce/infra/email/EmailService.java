package com.jeplabs.ecommerce.infra.email;

import com.jeplabs.ecommerce.domain.banco.DatosRespuestaCuentaBancaria;
import com.jeplabs.ecommerce.infra.config.MonedaFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final MonedaFormatter monedaFormatter; // ← inyectar

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

    @Async
    public void enviarConfirmacionOrden(String emailDestino,
                                        String nombreUsuario,
                                        Long ordenId) {
        String asunto = "Orden #" + ordenId + " recibida correctamente";
        String contenido = """
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hola %s,</h2>
                <p>Hemos recibido tu orden <strong>#%d</strong> correctamente.</p>
                <p>Tu orden está en estado <strong>PENDIENTE</strong>.</p>
                <p>Te notificaremos cuando sea confirmada.</p>
                <br>
                <a href="http://localhost:5173/ordenes/%d"
                   style="background-color: #28a745; color: white;
                          padding: 10px 20px; text-decoration: none;
                          border-radius: 5px;">
                    Ver mi orden
                </a>
                <br><br>
                <p>¡Gracias por tu compra!</p>
            </body>
            </html>
            """.formatted(nombreUsuario, ordenId, ordenId);
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

    @Async
    public void enviarEmailRestablecimientoPassword(String emailDestino,
                                                    String nombreUsuario,
                                                    String token) {
        String asunto = "Restablecimiento de contraseña";
        String enlace = "http://localhost:5173/reset-password?token=" + token;
        String contenido = """
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hola %s,</h2>
                <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                <p>Este enlace expirará en <strong>30 minutos</strong>.</p>
                <br>
                <a href="%s"
                   style="background-color: #007bff; color: white;
                          padding: 10px 20px; text-decoration: none;
                          border-radius: 5px;">
                    Restablecer contraseña
                </a>
                <br><br>
                <p>Si no solicitaste este cambio, ignora este email.</p>
                <p>Tu contraseña permanecerá sin cambios.</p>
            </body>
            </html>
            """.formatted(nombreUsuario, enlace);
        enviar(emailDestino, asunto, contenido);
    }

    @Async
    public void enviarDatosBancarios(String emailDestino, String nombreUsuario,
                                     Long ordenId, BigDecimal total,
                                     List<DatosRespuestaCuentaBancaria> cuentas) {
        String asunto = "Datos bancarios para tu orden #" + ordenId;

        StringBuilder cuentasHtml = new StringBuilder();
        for (DatosRespuestaCuentaBancaria cuenta : cuentas) {
            cuentasHtml.append("""
                <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
                    <p><strong>Banco:</strong> %s</p>
                    <p><strong>Titular:</strong> %s</p>
                    <p><strong>Tipo de cuenta:</strong> %s</p>
                    <p><strong>Número de cuenta:</strong> %s</p>
                    <p><strong>Moneda:</strong> %s</p>
                </div>
                """.formatted(
                    cuenta.banco(), cuenta.titular(),
                    cuenta.tipoCuenta(), cuenta.numeroCuenta(), cuenta.moneda()
            ));
        }

        String contenido = """
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hola %s,</h2>
                <p>Tu orden <strong>#%d</strong> ha sido registrada correctamente.</p>
                <p>Para confirmar tu compra, realiza una transferencia por el monto de
                   <strong>%s</strong> a una de las siguientes cuentas:</p>
                %s
                <p style="color: #e74c3c;"><strong>Importante:</strong> Sube tu comprobante
                   de pago desde tu historial de pedidos para agilizar la confirmación.</p>
                <br>
                <a href="http://localhost:5173/ordenes/%d"
                   style="background-color: #007bff; color: white;
                          padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Ver mi orden y subir comprobante
                </a>
            </body>
            </html>
            """.formatted(nombreUsuario, ordenId, monedaFormatter.formatear(total), cuentasHtml, ordenId);

        enviar(emailDestino, asunto, contenido);
    }

    @Async
    public void enviarNotificacionComprobante(String emailAdmin, Long ordenId,
                                              String nombreCliente) {
        String asunto = "Comprobante subido - Orden #" + ordenId;
        String contenido = """
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Nuevo comprobante de pago</h2>
                <p>El cliente <strong>%s</strong> ha subido un comprobante para
                   la orden <strong>#%d</strong>.</p>
                <br>
                <a href="http://localhost:5173/admin/ordenes/%d"
                   style="background-color: #28a745; color: white;
                          padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Ver orden y comprobante
                </a>
            </body>
            </html>
            """.formatted(nombreCliente, ordenId, ordenId);

        enviar(emailAdmin, asunto, contenido);
    }
}
