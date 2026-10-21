package com.jeplabs.ecommerce.infra.scheduler;

import com.jeplabs.ecommerce.domain.usuario.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class RefreshTokenScheduler {


    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${api.security.refresh-retention-days:30}")
    private int diasRetencion;

    /**
     * Purga física nocturna de Refresh Tokens expirados o revocados que superaron el periodo de retención.
     */
    @Scheduled(cron = "${api.security.refresh-purge-cron:0 30 3 * * *}")
    @Transactional
    public void purgarRefreshTokensAntiguos() {
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime limiteRetencion = ahora.minusDays(diasRetencion);

        int eliminados = refreshTokenRepository.purgarTokensAntiguos(ahora, limiteRetencion);
        if (eliminados > 0) {
            log.info("[Scheduler] Purga de Refresh Tokens completada: {} tokens antiguos eliminados.", eliminados);
        }
    }
}
