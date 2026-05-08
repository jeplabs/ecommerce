package com.jeplabs.ecommerce.infra.scheduler;

import com.jeplabs.ecommerce.domain.carrito.Carrito;
import com.jeplabs.ecommerce.domain.carrito.CarritoItemRepository;
import com.jeplabs.ecommerce.domain.carrito.CarritoRepository;
import com.jeplabs.ecommerce.infra.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

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

    // Corre cada hora
    // Corre cada minuto para pruebas en dev
    @Scheduled(
            fixedRateString = "${api.carrito.scheduler-intervalo}",
            initialDelayString = "${api.carrito.scheduler-delay-inicial}"
    )
    @Transactional
    public void procesarCarritos() {
        notificarCarritosProximosAExpirar();
        vaciarCarritosExpirados();
    }

    private void notificarCarritosProximosAExpirar() {
        LocalDateTime limite = LocalDateTime.now().plusMinutes(notificacionMinutosAntes);

        List<Carrito> carritosParaNotificar = carritoRepositorio
                .findCarritosParaNotificar(limite);

        for (Carrito carrito : carritosParaNotificar) {
            if (!carrito.getItems().isEmpty()) {
                long minutosRestantes = java.time.Duration.between(
                        LocalDateTime.now(), carrito.getExpiraAt()).toMinutes();

                emailService.enviarEmailCarritoAbandonado(
                        carrito.getUsuario().getEmail(),
                        carrito.getUsuario().getNombre(),
                        minutosRestantes
                );

                carrito.marcarNotificacionEnviada();
            }
        }
    }

    private void vaciarCarritosExpirados() {
        List<Carrito> carritosExpirados = carritoRepositorio
                .findCarritosExpirados(LocalDateTime.now());

        for (Carrito carrito : carritosExpirados) {
            emailService.enviarEmailCarritoVaciado(
                    carrito.getUsuario().getEmail(),
                    carrito.getUsuario().getNombre()
            );

            itemRepositorio.deleteAll(carrito.getItems());
            carrito.getItems().clear();
            carrito.marcarComoAbandonado();
        }
    }
}