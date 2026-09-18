package com.jeplabs.ecommerce.domain.pago.qpaypro;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface QPayProTransaccionRepository extends JpaRepository<QPayProTransaccion, Long> {
    Optional<QPayProTransaccion> findByOrdenIdAndEstado(Long ordenId, EstadoQPayPro estado);
    Optional<QPayProTransaccion> findByOrdenId(Long ordenId);
    Optional<QPayProTransaccion> findByToken(String token);
}
