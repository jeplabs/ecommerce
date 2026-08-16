package com.jeplabs.ecommerce.domain.pago.webpay;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WebpayTransaccionRepository extends JpaRepository<WebpayTransaccion, Long> {

    Optional<WebpayTransaccion> findByToken(String token);

    // Busca transacción iniciada para evitar duplicados
    Optional<WebpayTransaccion> findByOrdenIdAndEstado(
            Long ordenId, EstadoWebpayTransaccion estado);

    Optional<WebpayTransaccion> findByOrdenId(Long ordenId);

    // Para reconciliación de transacciones abandonadas o en timeout
    List<WebpayTransaccion> findByEstadoAndCreadoAtBefore(
            EstadoWebpayTransaccion estado, LocalDateTime antesDe);
}