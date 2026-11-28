package com.jeplabs.ecommerce.domain.producto;

import com.jeplabs.ecommerce.domain.categoria.Categoria;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Motor stateless de búsqueda multicampo y scoring de relevancia para el catálogo de productos.
 * Soporta normalización diacrítica (Unicode NFD), tokenización AND no posicional,
 * lematización ligera en español, expansión simétrica de sinónimos y prevención de falsos positivos.
 */
public final class ProductoBuscador {

    public static final int MAX_LONGITUD_CONSULTA = 150;
    public static final int MAX_TOKENS_CONSULTA = 10;

    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Pattern NON_ALNUM_PATTERN = Pattern.compile("[^a-z0-9]+");
    private static final Pattern HYPHEN_WORD_PATTERN = Pattern.compile("[a-z0-9]+(?:-[a-z0-9]+)+");
    private static final Pattern ALPHA_DIGIT_SEGMENT_PATTERN = Pattern.compile("[a-z]+|[0-9]+");

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "al", "con", "de", "del", "e", "el", "en", "la", "las", "los",
            "o", "para", "por", "u", "un", "una", "unas", "unos", "y"
    );

    private static final Set<String> INVARIABLES_PLURAL = Set.of(
            "asus", "bios", "bus", "dos", "focus", "freedos", "ios", "ips",
            "macos", "nas", "plus", "stylus", "tws", "victus", "windows"
    );

    // Pesos de relevancia por campo
    private static final int PESO_SKU_EXACTO = 200;
    private static final int PESO_SKU_COINCIDENCIA = 80;
    private static final int PESO_FRASE_EN_NOMBRE = 40;
    private static final int PESO_NOMBRE_DIRECTO_EXACTO = 50;
    private static final int PESO_NOMBRE_DIRECTO_PREFIJO = 35;
    private static final int PESO_NOMBRE_SINONIMO = 30;
    private static final int PESO_CATEGORIA_DIRECTO = 25;
    private static final int PESO_CATEGORIA_SINONIMO = 18;
    private static final int PESO_SPECS_DIRECTO = 20;
    private static final int PESO_SPECS_SINONIMO = 12;
    private static final int PESO_DESCRIPCION_DIRECTO = 8;
    private static final int PESO_DESCRIPCION_SINONIMO = 5;
    private static final int BONUS_DISPONIBLE = 5;

    private ProductoBuscador() {
    }

    public record TokenConsulta(String original, Set<String> directos, Set<String> sinonimos) {
        public boolean tieneSinonimos() {
            return !sinonimos.isEmpty();
        }
    }

    public record ConsultaBusqueda(String textoNormalizado, String textoCompacto, List<TokenConsulta> tokens) {
        public boolean estaVacia() {
            return tokens.isEmpty();
        }
    }

    /**
     * Remueve acentos y diacríticos de un texto de forma portable (ej: "Computación" -> "computacion").
     */
    public static String normalizarTexto(String texto) {
        if (texto == null) {
            return "";
        }
        String descompuesto = Normalizer.normalize(texto, Normalizer.Form.NFD);
        return DIACRITICS_PATTERN.matcher(descompuesto)
                .replaceAll("")
                .toLowerCase(Locale.ROOT)
                .trim();
    }

    /**
     * Normaliza un término individual para persistencia e indexación en el diccionario de sinónimos.
     */
    public static String normalizarTerminoSinonimo(String termino) {
        String normalizado = normalizarTexto(termino);
        if (normalizado.isEmpty()) {
            return "";
        }
        return NON_ALNUM_PATTERN.matcher(normalizado).replaceAll("");
    }

    /**
     * Construye el mapa bidireccional y simétrico a partir de grupos de términos equivalentes.
     */
    public static Map<String, Set<String>> construirMapaSinonimos(Collection<Collection<String>> grupos) {
        if (grupos == null || grupos.isEmpty()) {
            return Map.of();
        }
        Map<String, Set<String>> temporal = new HashMap<>();
        for (Collection<String> grupo : grupos) {
            if (grupo == null) {
                continue;
            }
            Set<String> canonicos = new LinkedHashSet<>();
            for (String raw : grupo) {
                String limpio = normalizarTerminoSinonimo(raw);
                if (limpio.length() >= 2) {
                    canonicos.add(limpio);
                    String singular = reducirPlural(limpio);
                    if (!singular.equals(limpio) && singular.length() >= 2) {
                        canonicos.add(singular);
                    }
                }
            }
            if (canonicos.size() < 2) {
                continue;
            }
            for (String termino : canonicos) {
                Set<String> equivalentes = temporal.computeIfAbsent(termino, k -> new LinkedHashSet<>());
                for (String otro : canonicos) {
                    if (!otro.equals(termino)) {
                        equivalentes.add(otro);
                    }
                }
            }
        }
        Map<String, Set<String>> inmutable = new HashMap<>();
        temporal.forEach((k, v) -> inmutable.put(k, Set.copyOf(v)));
        return Map.copyOf(inmutable);
    }

    /**
     * Lematización conservadora de plurales regulares en español para mejorar el recall sin falsos positivos.
     */
    public static String reducirPlural(String token) {
        if (token == null || token.length() < 4 || INVARIABLES_PLURAL.contains(token)) {
            return token == null ? "" : token;
        }
        // No tocar códigos alfanuméricos con dígitos (ej. rtx4050, ps5, 16gb, 60hz)
        for (int i = 0; i < token.length(); i++) {
            if (Character.isDigit(token.charAt(i))) {
                return token;
            }
        }
        if (token.endsWith("ces") && token.length() >= 5) {
            return token.substring(0, token.length() - 3) + "z";
        }
        if ((token.endsWith("iones")
                || token.endsWith("ones")
                || token.endsWith("ores")
                || token.endsWith("ares")
                || token.endsWith("iles")) && token.length() >= 6) {
            return token.substring(0, token.length() - 2);
        }
        if (token.endsWith("s")
                && !token.endsWith("ss")
                && !token.endsWith("us")
                && !token.endsWith("is")
                && !token.endsWith("ws")) {
            return token.substring(0, token.length() - 1);
        }
        return token;
    }

    /**
     * Prepara y normaliza una consulta de usuario una única vez por petición HTTP.
     */
    public static ConsultaBusqueda prepararConsulta(String terminoRaw, Map<String, Set<String>> mapaSinonimos) {
        if (terminoRaw == null || terminoRaw.isBlank()) {
            return new ConsultaBusqueda("", "", List.of());
        }
        String acotado = terminoRaw.trim();
        if (acotado.length() > MAX_LONGITUD_CONSULTA) {
            acotado = acotado.substring(0, MAX_LONGITUD_CONSULTA);
        }

        String textoNormalizado = normalizarTexto(acotado);
        if (textoNormalizado.isEmpty()) {
            return new ConsultaBusqueda("", "", List.of());
        }

        String[] partesCrudas = textoNormalizado.split("\\s+");
        List<String> tokensCrudos = new ArrayList<>();
        for (String parte : partesCrudas) {
            String limpio = NON_ALNUM_PATTERN.matcher(parte).replaceAll("");
            if (!limpio.isEmpty()) {
                tokensCrudos.add(limpio);
            }
        }
        if (tokensCrudos.isEmpty()) {
            return new ConsultaBusqueda(textoNormalizado, "", List.of());
        }

        // Filtrar stop-words solo si queda al menos un token significativo
        List<String> significativos = tokensCrudos.stream()
                .filter(t -> !STOP_WORDS.contains(t))
                .toList();
        List<String> efectivos = significativos.isEmpty() ? tokensCrudos : significativos;
        if (efectivos.size() > MAX_TOKENS_CONSULTA) {
            efectivos = efectivos.subList(0, MAX_TOKENS_CONSULTA);
        }

        Map<String, Set<String>> dicc = mapaSinonimos != null ? mapaSinonimos : Map.of();
        List<TokenConsulta> tokens = new ArrayList<>(efectivos.size());
        for (String token : efectivos) {
            Set<String> directos = new LinkedHashSet<>();
            directos.add(token);
            String singular = reducirPlural(token);
            if (!singular.equals(token) && singular.length() >= 2) {
                directos.add(singular);
            }

            Set<String> sinonimos = new LinkedHashSet<>();
            for (String d : directos) {
                Set<String> encontrados = dicc.get(d);
                if (encontrados != null) {
                    for (String sin : encontrados) {
                        if (!directos.contains(sin)) {
                            sinonimos.add(sin);
                        }
                    }
                }
            }
            tokens.add(new TokenConsulta(token, Set.copyOf(directos), Set.copyOf(sinonimos)));
        }

        String textoCompacto = NON_ALNUM_PATTERN.matcher(textoNormalizado).replaceAll("");
        return new ConsultaBusqueda(textoNormalizado, textoCompacto, List.copyOf(tokens));
    }

    /**
     * Evalúa si el producto satisface todos los tokens de la consulta (AND) y retorna su puntaje de relevancia.
     * Retorna 0 cuando el producto no coincide con la búsqueda.
     */
    public static int calcularRelevancia(Producto producto, ConsultaBusqueda consulta) {
        if (producto == null || consulta == null || consulta.estaVacia()) {
            return 1;
        }

        String skuNorm = normalizarTexto(producto.getSku());
        String skuCompacto = NON_ALNUM_PATTERN.matcher(skuNorm).replaceAll("");

        CampoIndexado campoSku = indexarCampo(producto.getSku());
        CampoIndexado campoNombre = indexarCampo(producto.getNombre());
        CampoIndexado campoCategorias = indexarCategorias(producto.getCategorias());
        CampoIndexado campoSpecsValores = indexarValoresSpecs(producto.getSpecs());
        CampoIndexado campoDescripcion = indexarCampo(producto.getDescripcion());

        int scoreTotal = 0;

        // Bonus por coincidencia exacta de SKU completo (ej. búsqueda directa por código de parte)
        if (!skuNorm.isEmpty()
                && (skuNorm.equals(consulta.textoNormalizado())
                || (!consulta.textoCompacto().isEmpty() && skuCompacto.equals(consulta.textoCompacto())))) {
            scoreTotal += PESO_SKU_EXACTO;
        }

        // Bonus si la frase completa aparece en el nombre del producto
        if (!campoNombre.textoPlano().isEmpty()
                && consulta.tokens().size() > 1
                && campoNombre.textoPlano().contains(consulta.textoNormalizado())) {
            scoreTotal += PESO_FRASE_EN_NOMBRE;
        }

        // Coincidencia AND: cada token debe satisfacerse en al menos un campo (directo o sinónimo)
        for (TokenConsulta token : consulta.tokens()) {
            int mejorScoreToken = 0;

            // 1. SKU
            if (coincideEnSku(skuNorm, skuCompacto, campoSku, token.directos())) {
                mejorScoreToken = Math.max(mejorScoreToken, PESO_SKU_COINCIDENCIA);
            }

            // 2. Nombre
            MatchNivel matchNombreDirecto = evaluarMatchCampo(campoNombre, token.directos());
            if (matchNombreDirecto == MatchNivel.EXACTO) {
                mejorScoreToken = Math.max(mejorScoreToken, PESO_NOMBRE_DIRECTO_EXACTO);
            } else if (matchNombreDirecto == MatchNivel.PARCIAL) {
                mejorScoreToken = Math.max(mejorScoreToken, PESO_NOMBRE_DIRECTO_PREFIJO);
            } else if (evaluarMatchCampo(campoNombre, token.sinonimos()) != MatchNivel.NINGUNO) {
                mejorScoreToken = Math.max(mejorScoreToken, PESO_NOMBRE_SINONIMO);
            }

            // 3. Categorías asignadas
            if (evaluarMatchCampo(campoCategorias, token.directos()) != MatchNivel.NINGUNO) {
                mejorScoreToken = Math.max(mejorScoreToken, PESO_CATEGORIA_DIRECTO);
            } else if (evaluarMatchCampo(campoCategorias, token.sinonimos()) != MatchNivel.NINGUNO) {
                mejorScoreToken = Math.max(mejorScoreToken, PESO_CATEGORIA_SINONIMO);
            }

            // 4. Valores de specs JSONB (sin llaves)
            if (evaluarMatchCampo(campoSpecsValores, token.directos()) != MatchNivel.NINGUNO) {
                mejorScoreToken = Math.max(mejorScoreToken, PESO_SPECS_DIRECTO);
            } else if (evaluarMatchCampo(campoSpecsValores, token.sinonimos()) != MatchNivel.NINGUNO) {
                mejorScoreToken = Math.max(mejorScoreToken, PESO_SPECS_SINONIMO);
            }

            // 5. Descripción
            if (evaluarMatchCampo(campoDescripcion, token.directos()) != MatchNivel.NINGUNO) {
                mejorScoreToken = Math.max(mejorScoreToken, PESO_DESCRIPCION_DIRECTO);
            } else if (evaluarMatchCampo(campoDescripcion, token.sinonimos()) != MatchNivel.NINGUNO) {
                mejorScoreToken = Math.max(mejorScoreToken, PESO_DESCRIPCION_SINONIMO);
            }

            if (mejorScoreToken == 0) {
                return 0;
            }
            scoreTotal += mejorScoreToken;
        }

        if (producto.getEstado() == EstadoProducto.DISPONIBLE) {
            scoreTotal += BONUS_DISPONIBLE;
        }

        return scoreTotal;
    }

    private enum MatchNivel {
        NINGUNO, PARCIAL, EXACTO
    }

    private record CampoIndexado(String textoPlano, Set<String> palabrasExactas, Set<String> palabrasSingular) {
        static final CampoIndexado VACIO = new CampoIndexado("", Set.of(), Set.of());
    }

    private static boolean coincideEnSku(
            String skuNorm, String skuCompacto, CampoIndexado campoSku, Set<String> terminos) {
        if (skuNorm.isEmpty()) {
            return false;
        }
        for (String term : terminos) {
            if (term.length() <= 2) {
                if (skuNorm.equals(term) || campoSku.palabrasExactas().contains(term)) {
                    return true;
                }
            } else if (skuNorm.contains(term) || skuCompacto.contains(term)) {
                return true;
            }
        }
        return false;
    }

    private static MatchNivel evaluarMatchCampo(CampoIndexado campo, Set<String> terminos) {
        if (campo.palabrasExactas().isEmpty() || terminos.isEmpty()) {
            return MatchNivel.NINGUNO;
        }
        MatchNivel mejor = MatchNivel.NINGUNO;
        for (String term : terminos) {
            if (campo.palabrasExactas().contains(term) || campo.palabrasSingular().contains(term)) {
                return MatchNivel.EXACTO;
            }
            // Tokens cortos (<= 3 chars como "lg", "pc", "ram") requieren palabra exacta para evitar falsos positivos
            if (term.length() >= 4) {
                for (String palabra : campo.palabrasExactas()) {
                    if (palabra.startsWith(term)) {
                        mejor = MatchNivel.PARCIAL;
                        break;
                    }
                }
            }
        }
        return mejor;
    }

    private static CampoIndexado indexarCategorias(List<Categoria> categorias) {
        if (categorias == null || categorias.isEmpty()) {
            return CampoIndexado.VACIO;
        }
        StringBuilder sb = new StringBuilder();
        for (Categoria c : categorias) {
            if (c != null && c.getNombre() != null) {
                sb.append(c.getNombre()).append(' ');
            }
        }
        return indexarCampo(sb.toString());
    }

    private static CampoIndexado indexarValoresSpecs(Map<String, Object> specs) {
        if (specs == null || specs.isEmpty()) {
            return CampoIndexado.VACIO;
        }
        StringBuilder sb = new StringBuilder();
        for (Object valor : specs.values()) {
            if (valor != null) {
                sb.append(valor).append(' ');
            }
        }
        return indexarCampo(sb.toString());
    }

    private static CampoIndexado indexarCampo(String texto) {
        if (texto == null || texto.isBlank()) {
            return CampoIndexado.VACIO;
        }
        String norm = normalizarTexto(texto);
        if (norm.isEmpty()) {
            return CampoIndexado.VACIO;
        }

        Set<String> exactas = new HashSet<>();
        Set<String> singulares = new HashSet<>();

        // Conservar unión de palabras con guion (ej. "wi-fi" -> "wifi", "smart-tv" -> "smarttv")
        Matcher hyphenMatcher = HYPHEN_WORD_PATTERN.matcher(norm);
        while (hyphenMatcher.find()) {
            String unido = hyphenMatcher.group().replace("-", "");
            if (unido.length() >= 2) {
                agregarPalabra(unido, exactas, singulares);
            }
        }

        String[] tokens = NON_ALNUM_PATTERN.split(norm);
        List<String> secuencia = new ArrayList<>(tokens.length);
        for (String tok : tokens) {
            if (tok.isEmpty()) {
                continue;
            }
            secuencia.add(tok);
            agregarPalabra(tok, exactas, singulares);

            // Separar fronteras letra/dígito para códigos técnicos (ej. "rtx4050" -> "rtx", "4050"; "ram32gb" -> "ram", "32", "gb", "32gb")
            if (contieneLetrasYDigitos(tok)) {
                List<String> segmentos = new ArrayList<>();
                Matcher m = ALPHA_DIGIT_SEGMENT_PATTERN.matcher(tok);
                while (m.find()) {
                    String seg = m.group();
                    segmentos.add(seg);
                    if (seg.length() >= 2) {
                        agregarPalabra(seg, exactas, singulares);
                    }
                }
                for (int i = 0; i + 1 < segmentos.size(); i++) {
                    String par = segmentos.get(i) + segmentos.get(i + 1);
                    if (par.length() >= 3) {
                        agregarPalabra(par, exactas, singulares);
                    }
                }
            }
        }

        // Bigramas compactos cuando uno de los dos tokens es numérico o modelo corto (ej. "32" + "gb" -> "32gb", "rtx" + "4050" -> "rtx4050")
        for (int i = 0; i + 1 < secuencia.size(); i++) {
            String a = secuencia.get(i);
            String b = secuencia.get(i + 1);
            if ((esNumerico(a) && b.length() <= 4) || (a.length() <= 4 && esNumerico(b))) {
                agregarPalabra(a + b, exactas, singulares);
            }
        }

        return new CampoIndexado(norm, exactas, singulares);
    }

    private static void agregarPalabra(String palabra, Set<String> exactas, Set<String> singulares) {
        exactas.add(palabra);
        String singular = reducirPlural(palabra);
        if (!singular.equals(palabra)) {
            singulares.add(singular);
        }
    }

    private static boolean contieneLetrasYDigitos(String s) {
        boolean letra = false;
        boolean digito = false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c >= 'a' && c <= 'z') {
                letra = true;
            } else if (c >= '0' && c <= '9') {
                digito = true;
            }
            if (letra && digito) {
                return true;
            }
        }
        return false;
    }

    private static boolean esNumerico(String s) {
        if (s.isEmpty()) {
            return false;
        }
        for (int i = 0; i < s.length(); i++) {
            if (!Character.isDigit(s.charAt(i))) {
                return false;
            }
        }
        return true;
    }
}
