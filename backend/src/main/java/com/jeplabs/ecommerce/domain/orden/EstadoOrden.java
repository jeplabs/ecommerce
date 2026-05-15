package com.jeplabs.ecommerce.domain.orden;

import java.util.Set;

public enum EstadoOrden {
    PENDIENTE,
    CONFIRMADA,
    EN_PROCESO,
    ENVIADA,
    ENTREGADA,
    CANCELADA;

    // Define desde qué estados se puede transicionar a cada estado
    public boolean puedeTransicionarA(EstadoOrden nuevoEstado) {
        return switch (this) {
            case PENDIENTE   -> Set.of(CONFIRMADA, CANCELADA).contains(nuevoEstado);
            case CONFIRMADA  -> Set.of(EN_PROCESO, CANCELADA).contains(nuevoEstado);
            case EN_PROCESO  -> Set.of(ENVIADA).contains(nuevoEstado);
            case ENVIADA     -> Set.of(ENTREGADA).contains(nuevoEstado);
            case ENTREGADA,
                 CANCELADA   -> false; // estados finales, no se puede cambiar
        };
    }

    public boolean esCancelable() {
        return this == PENDIENTE || this == CONFIRMADA;
    }
}
