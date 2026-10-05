package com.jeplabs.ecommerce.infra.scheduler;

import com.jeplabs.ecommerce.domain.carrito.Carrito;
import com.jeplabs.ecommerce.domain.carrito.CarritoItemRepository;
import com.jeplabs.ecommerce.domain.carrito.CarritoRepository;
import com.jeplabs.ecommerce.infra.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CarritoScheduler {

    private final CarritoRepository carritoRepositorio;
    private final CarritoItemRepository itemRepositorio;
    private final EmailService emailService;

    @Value("${api.carrito.expiracion-minutos}")
    private long expiracionMinutos;

    @Value("${api.carrito.notificacion-minutos-antes}")
    private long notificacionMinutosAntes;

    @Value("${api.carrito.dias-retencion-expirados:30}")
    private long diasRetencionExpirados;

    @Scheduled(
            fixedRateString = "${api.carrito.scheduler-intervalo}",
            initialDelayString = "${api.carrito.scheduler-delay-inicial}"
    )
    @Transactional
    public void procesarCarritos() {
        notificarCarritosProximosAExpirar();
        marcarCarritosExpirados();
        purgarCarritosAntiguos();
    }

    private void notificarCarritosProximosAExpirar() {
        LocalDateTime limite = LocalDateTime.now().plusMinutes(notificacionMinutosAntes);

        List<Carrito> carritosParaNotificar = carritoRepositorio
                .findCarritosParaNotificar(limite);

        for (Carrito carrito : carritosParaNotificar) {
            if (!carrito.getItems().isEmpty()) {
                long minutosRestantes = Duration.between(
                        LocalDateTime.now(), carrito.getExpiraAt()).toMinutes();

                try {
                    emailService.enviarEmailCarritoAbandonado(
                            carrito.getUsuario().getEmail(),
                            carrito.getUsuario().getNombre(),
                            minutosRestantes
                    );
                } catch (Exception e) {
                    log.warn("Fallo al enviar email de carrito próximo a expirar para {}: {}",
                            carrito.getUsuario().getEmail(), e.getMessage());
                }

                carrito.marcarNotificacionEnviada();
            }
        }
    }

    private void marcarCarritosExpirados() {
        List<Carrito> carritosExpirados = carritoRepositorio
                .findCarritosExpirados(LocalDateTime.now());

        for (Carrito carrito : carritosExpirados) {
            try {
                emailService.enviarEmailCarritoVaciado(
                        carrito.getUsuario().getEmail(),
                        carrito.getUsuario().getNombre()
                );
            } catch (Exception e) {
                log.warn("Fallo al enviar email de carrito expirado para {}: {}",
                        carrito.getUsuario().getEmail(), e.getMessage());
            }

            // Expiración suave (soft-expire): conserva los items para permitir restauración posterior
            carrito.marcarComoExpirado();
        }
    }

    private void purgarCarritosAntiguos() {
        try {
            LocalDateTime limitePurga = LocalDateTime.now().minusDays(diasRetencionExpirados);
            int itemsEliminados = itemRepositorio.purgarItemsDeCarritosAntiguos(limitePurga);
            int carritosEliminados = carritoRepositorio.purgarCarritosAntiguos(limitePurga);
            if (carritosEliminados > 0 || itemsEliminados > 0) {
                log.info("Purga de carritos completada: {} carritos y {} items eliminados físicamente",
                        carritosEliminados, itemsEliminados);
            }
        } catch (Exception e) {
            log.error("Error durante la purga de carritos antiguos", e);
        }
    }
}