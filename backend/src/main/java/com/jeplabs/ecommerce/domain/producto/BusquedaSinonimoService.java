package com.jeplabs.ecommerce.domain.producto;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class BusquedaSinonimoService {

    private static final long CACHE_TTL_NANOS = TimeUnit.MINUTES.toNanos(5);
    private static final int MAX_LONGITUD_TERMINOS = 500;

    private final BusquedaSinonimoRepository repositorio;

    private volatile CacheSnapshot cacheSnapshot;

    private record CacheSnapshot(Map<String, Set<String>> mapa, long expiraEnNanos) {}

    /**
     * Retorna el mapa simétrico de sinónimos activos desde caché en RAM (O(1)).
     * Se recarga desde PostgreSQL solo en frío, al expirar el TTL (5 min) o tras invalidación.
     */
    @Transactional(readOnly = true)
    public Map<String, Set<String>> obtenerMapaSinonimos() {
        long ahora = System.nanoTime();
        CacheSnapshot actual = this.cacheSnapshot;
        if (actual != null && ahora < actual.expiraEnNanos()) {
            return actual.mapa();
        }
        synchronized (this) {
            ahora = System.nanoTime();
            actual = this.cacheSnapshot;
            if (actual != null && ahora < actual.expiraEnNanos()) {
                return actual.mapa();
            }
            List<Collection<String>> grupos = repositorio.findByActivoTrueOrderByNombreGrupoAsc()
                    .stream()
                    .<Collection<String>>map(BusquedaSinonimo::obtenerListaTerminos)
                    .toList();
            Map<String, Set<String>> mapa = ProductoBuscador.construirMapaSinonimos(grupos);
            this.cacheSnapshot = new CacheSnapshot(mapa, ahora + CACHE_TTL_NANOS);
            return mapa;
        }
    }

    public void invalidarCache() {
        this.cacheSnapshot = null;
    }

    @Transactional(readOnly = true)
    public List<DatosRespuestaBusquedaSinonimo> listarTodos() {
        return repositorio.findAllByOrderByNombreGrupoAsc()
                .stream()
                .map(DatosRespuestaBusquedaSinonimo::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public DatosRespuestaBusquedaSinonimo buscarPorId(Long id) {
        return new DatosRespuestaBusquedaSinonimo(buscarEntidad(id));
    }

    @Transactional
    public DatosRespuestaBusquedaSinonimo crear(DatosCrearBusquedaSinonimo datos) {
        String nombreGrupo = datos.nombreGrupo().trim();
        if (repositorio.existsByNombreGrupoIgnoreCase(nombreGrupo)) {
            throw new IllegalArgumentException("Ya existe un grupo de sinónimos con el nombre: " + nombreGrupo);
        }

        String terminosNormalizados = normalizarYValidarTerminos(datos.terminos());
        boolean activo = datos.activo() == null || datos.activo();

        BusquedaSinonimo guardado = repositorio.save(new BusquedaSinonimo(nombreGrupo, terminosNormalizados, activo));
        invalidarCache();
        return new DatosRespuestaBusquedaSinonimo(guardado);
    }

    @Transactional
    public DatosRespuestaBusquedaSinonimo actualizar(Long id, DatosActualizarBusquedaSinonimo datos) {
        BusquedaSinonimo entidad = buscarEntidad(id);
        String nombreGrupo = datos.nombreGrupo().trim();
        if (repositorio.existsByNombreGrupoIgnoreCaseAndIdNot(nombreGrupo, id)) {
            throw new IllegalArgumentException("Ya existe otro grupo de sinónimos con el nombre: " + nombreGrupo);
        }

        String terminosNormalizados = normalizarYValidarTerminos(datos.terminos());
        boolean activo = datos.activo() != null ? datos.activo() : entidad.isActivo();

        entidad.actualizar(nombreGrupo, terminosNormalizados, activo);
        invalidarCache();
        return new DatosRespuestaBusquedaSinonimo(entidad);
    }

    @Transactional
    public DatosRespuestaBusquedaSinonimo toggleActivo(Long id) {
        BusquedaSinonimo entidad = buscarEntidad(id);
        entidad.toggleActivo();
        invalidarCache();
        return new DatosRespuestaBusquedaSinonimo(entidad);
    }

    @Transactional
    public void eliminar(Long id) {
        BusquedaSinonimo entidad = buscarEntidad(id);
        repositorio.delete(entidad);
        invalidarCache();
    }

    private BusquedaSinonimo buscarEntidad(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Grupo de sinónimos no encontrado con ID: " + id));
    }

    private String normalizarYValidarTerminos(List<String> terminosRaw) {
        Set<String> unicos = new LinkedHashSet<>();
        for (String t : terminosRaw) {
            String limpio = ProductoBuscador.normalizarTerminoSinonimo(t);
            if (limpio.length() >= 2) {
                unicos.add(limpio);
            }
        }
        if (unicos.size() < 2) {
            throw new IllegalArgumentException(
                    "Un grupo de sinónimos debe contener al menos 2 términos alfanuméricos distintos de mínimo 2 caracteres");
        }
        String joined = String.join(",", unicos);
        if (joined.length() > MAX_LONGITUD_TERMINOS) {
            throw new IllegalArgumentException(
                    "La lista de términos supera el límite máximo de " + MAX_LONGITUD_TERMINOS + " caracteres");
        }
        return joined;
    }
}
