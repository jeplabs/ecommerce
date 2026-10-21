package com.jeplabs.ecommerce.domain.usuario;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RefreshToken r JOIN FETCH r.usuario WHERE r.tokenHash = :tokenHash")
    Optional<RefreshToken> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("""
            UPDATE RefreshToken r
            SET r.revocado = true
            WHERE r.familyId = :familyId
            AND r.revocado = false
            """)
    int revocarFamilia(@Param("familyId") String familyId);

    @Modifying
    @Query("""
            UPDATE RefreshToken r
            SET r.revocado = true
            WHERE r.usuario.id = :usuarioId
            AND r.revocado = false
            """)
    int revocarTodosPorUsuario(@Param("usuarioId") Long usuarioId);

    @Modifying
    @Query("""
            DELETE FROM RefreshToken r
            WHERE (r.revocado = true OR r.expiraAt < :ahora)
            AND r.creadoAt < :limiteRetencion
            """)
    int purgarTokensAntiguos(
            @Param("ahora") LocalDateTime ahora,
            @Param("limiteRetencion") LocalDateTime limiteRetencion);
}
