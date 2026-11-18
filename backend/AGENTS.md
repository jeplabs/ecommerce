# Reglas de Arquitectura y Desarrollo Backend (`./backend`)

Estas reglas aplican a todo el directorio `/backend` (Java 21 + Spring Boot `4.0.3`). Todo cambio debe respetar estrictamente las convenciones y librerías reales instaladas en `pom.xml`.

## 1. Stack Real y Restricciones de Dependencias

- **Instalado en `pom.xml`**:
  - Spring Boot `4.0.3` (`webmvc`, `web`, `data-jpa`, `validation`, `security`, `flyway`, `mail`).
  - Persistencia: PostgreSQL (`org.postgresql:postgresql`), Flyway (`flyway-database-postgresql`), H2 (`scope=test`).
  - Seguridad: `com.auth0:java-jwt:4.5.1`.
  - Integraciones: `com.cloudinary:cloudinary-http44:1.38.0`, `com.github.transbankdevelopers:transbank-sdk-java:6.2.1`, `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.6`.
  - Utilidades: `org.projectlombok:lombok`.
- **PROHIBIDO asumir o importar librerías no instaladas**:
  - **NO uses MapStruct ni ModelMapper** (el mapeo se hace manualmente en constructores de `record` y métodos de entidad).
  - **NO uses `io.jsonwebtoken` (JJWT)** (este proyecto usa exclusivamente `com.auth0.jwt.JWT`).
  - **NO uses WebClient / WebFlux** (las llamadas HTTP síncronas externas usan el bean `RestTemplate` configurado en `RestTemplateConfig` o el SDK oficial de Transbank).

## 2. Estructura de Paquetes (`com.jeplabs.ecommerce`)

Respeta la organización modular por dominio e infraestructura:

1. **`controller/`**: Únicamente controladores REST (`@RestController`).
   - Anota con `@RequiredArgsConstructor` para inyección por constructor y `@Tag` / `@Operation` / `@ApiResponses` de SpringDoc OpenAPI.
   - Los controladores NO contienen lógica de negocio ni inyectan repositorios directamente; delegan siempre al `*Service` correspondiente.
   - Usa `@PreAuthorize("hasRole('ADMIN')")` para proteger endpoints administrativos y `Authentication authentication` (`authentication.getName()`) para obtener el email del usuario autenticado.
2. **`domain/<modulo>/`**: Packaging by feature (`banco`, `carrito`, `categoria`, `direccion`, `envio`, `favorito`, `orden`, `pago`, `pago.qpaypro`, `pago.webpay`, `producto`, `sucursal`, `usuario`).
   - Dentro de cada paquete de dominio coexisten: Entidad(es) JPA, interfaz `*Repository`, clase `*Service`, `enum`s de estado, calculadores/schedulers propios del dominio y todos sus DTOs (`Datos*`). No crees subpaquetes artificiales como `dto/`, `entity/`, `repository/` o `service/` dentro del dominio.
3. **`infra/`**: Componentes transversales:
   - `infra.security`: `SecurityConfigurations`, `FiltroSeguridad`, `TokenService`, `RefreshCookieHelper`, `UsuarioDetailsService`, handlers 401/403.
   - `infra.exceptions`: `GestorDeErrores` (`@RestControllerAdvice`) y excepciones de negocio personalizadas.
   - `infra.config`: `MonedaConfig`, `MonedaFormatter`, `CorsConfig`, `StorageConfig`, `WebMvcConfig`, `WebpayConfig`.
   - `infra.storage`: `StorageService`, `LocalStorageService`, `CloudinaryStorageService`, `ArchivoValidator`.
   - `infra.scheduler`: `CarritoScheduler`, `RefreshTokenScheduler`.
   - `infra.email`: `EmailService` (envío asíncrono con `@Async`).
   - `infra.validation`: Anotaciones `@ValidPassword`, `@PasswordMatch` y sus validadores.

## 3. Convenciones de DTOs y Mapeo

- **Java Records obligatorios**: Todo DTO de entrada o salida debe ser un `public record` inmutable ubicado en su paquete `domain/<modulo>/`.
- **Nomenclatura estricta con prefijo `Datos*`**:
  - Creación (POST): `DatosCrear<Entidad>` o `DatosRegistro`, `DatosAgregarItem`, `DatosIniciarWebpay`.
  - Actualización parcial/total (PATCH/PUT): `DatosActualizar<Entidad>`.
  - Respuesta (GET/POST/PATCH): `DatosRespuesta<Entidad>`.
- **Mapeo Entidad -> DTO**: Los records de respuesta definen un constructor secundario `public DatosRespuestaX(Entidad entidad)` que delega al constructor canónico `this(...)`.
- **Mapeo DTO -> Entidad**: Las entidades JPA definen constructores de negocio `public Entidad(DatosCrearX datos, ...)` y métodos de mutación semánticos (`actualizar(DatosActualizarX datos)`, `cambiarEstado(...)`, `descontarStock(...)`, `devolverStock(...)`) en lugar de exponer `@Setter` indiscriminados en toda la clase.
- **Validaciones**: Usa `jakarta.validation.constraints.*` (`@NotBlank`, `@NotNull`, `@Positive`, `@Size`, `@Email`) en los componentes del `record` de entrada con mensajes en español, y valida en el controlador con `@RequestBody @Valid`.

## 4. Reglas de Entidades JPA y Base de Datos (PostgreSQL + Flyway)

- **Lombok en Entidades JPA**:
  - Usa `@Getter`, `@NoArgsConstructor`, `@AllArgsConstructor` y `@EqualsAndHashCode(of = "id")`.
  - **Evita `@Data` o `@ToString` sin exclusiones** en entidades JPA para no disparar `LazyInitializationException` ni recursión infinita en relaciones bidireccionales.
- **Relaciones y Carga Perezosa**:
  - Usa siempre `fetch = FetchType.LAZY` en `@ManyToOne`, `@OneToMany` y `@ManyToMany`.
  - Nota que en test (`application-test.properties`) está activo `spring.jpa.open-in-view=false`; toda relación necesaria para construir el DTO de respuesta debe resolverse dentro de la transacción del servicio (`@Transactional`).
- **Tipos Especiales y Concurrencia**:
  - Columnas `JSONB` (como `productos.specs` y `metodos_pago.configuracion`) usan `@JdbcTypeCode(SqlTypes.JSON)` y `@Column(columnDefinition = "jsonb")`.
  - `Producto` utiliza bloqueo optimista mediante `@Version private Integer version;`.
  - Cálculos monetarios e impuestos (`IvaCalculator`, `EnvioCalculator`, `MonedaConfig`) usan exclusivamente `BigDecimal` con `RoundingMode.HALF_UP`. Nunca uses `double` o `float` para almacenar o calcular precios, subtotales o impuestos (salvo en la llamada final al SDK de Transbank que exige `double` ya redondeado a entero CLP).
- **Migraciones Flyway (`spring.jpa.hibernate.ddl-auto=validate`)**:
  - Hibernate valida el esquema al arrancar; cualquier cambio en una entidad `@Entity` requiere su migración SQL correspondiente.
  - Estructura actual de Flyway:
    - `src/main/resources/db/migration/V1__init_schema.sql`: Esquema base consolidado.
    - `src/main/resources/db/migration/V2__seed_initial_data.sql`: Datos operativos base (métodos de pago, envíos, sucursales, cuenta bancaria).
    - `src/main/resources/db/seed/V3__...` a `V7__...`: Semillas de catálogo para entorno `dev`.
  - Nombra nuevas migraciones de esquema siguiendo el correlativo en `db/migration/` (o consulta antes de modificar migraciones existentes si se trabaja en entorno de desarrollo).

## 5. Manejo de Errores (`GestorDeErrores`)

- Todas las respuestas de error devuelven un `Map<String, String>` serializado a JSON:
  - Errores de negocio/estado/stock/404/401/403/500: `{"error": "Mensaje descriptivo"}`.
  - Errores con código específico para el frontend:
    - `CarritoExpiradoException` -> HTTP `410 GONE` con `{"error": "...", "codigo": "CARRITO_EXPIRADO"}`.
    - `RefreshTokenInvalidoException` -> HTTP `401 UNAUTHORIZED` con `{"error": "...", "codigo": "REFRESH_TOKEN_INVALIDO"}`.
  - Errores de validación (`MethodArgumentNotValidException`) -> HTTP `400 BAD_REQUEST` con mapa `{ "campo": "mensaje1 | mensaje2" }`.
  - Errores HTTP de pasarelas externas (`RestClientResponseException`) -> HTTP `502 BAD_GATEWAY` (nunca `401`).

## 6. Reglas de Testing (`src/test/java`)

- **Ejecución**: Usa `./mvnw test` (o `.\mvnw.cmd test` en Windows PowerShell).
- **Pruebas Unitarias de Servicios y Dominio (`*ServiceTest`, `*Test`)**:
  - Usa JUnit 5 + Mockito puro: `@ExtendWith(MockitoExtension.class)` (y `@MockitoSettings(strictness = Strictness.LENIENT)` cuando aplique), `@Mock` y `@InjectMocks`.
  - Organiza los casos por método o escenario usando clases internas `@Nested` y nombres descriptivos con `@DisplayName("...")`.
  - Usa aserciones fluidas de **AssertJ** (`assertThat(...)`, `assertThatThrownBy(...)`).
- **Pruebas de Controladores (`*ControllerTest`)**:
  - El proyecto utiliza **Spring Boot 4.0.3**:
    - Usa `@SpringBootTest`, `@AutoConfigureMockMvc` (del paquete `org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc`) y `@ActiveProfiles("test")`.
    - **Usa `@MockitoBean`** (`org.springframework.test.context.bean.override.mockito.MockitoBean`) en lugar del antiguo `@MockBean` deprecado/eliminado en Spring Boot 4.
    - Instancia `ObjectMapper` directamente (`new ObjectMapper().findAndRegisterModules()`) o según el patrón de `OrdenControllerTest`.
    - Simula usuarios y roles con `@WithMockUser(username = "...", roles = {"CUSTOMER" | "ADMIN"})`.
- **Perfil `test` (`src/test/resources/application-test.properties`)**:
  - Usa H2 en memoria con `spring.flyway.enabled=false` y `spring.jpa.hibernate.ddl-auto=none` para que el contexto levante rápido sin requerir PostgreSQL activo.
