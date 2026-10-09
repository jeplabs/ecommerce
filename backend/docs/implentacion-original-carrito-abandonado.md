# Carritos con expiración y notificaciones

## ¿Cómo funciona esto técnicamente?

Se necesitan tres cosas: un campo de expiración en el carrito, un proceso que corra automáticamente en segundo plano revisando carritos vencidos, y un sistema de envío de emails.

1. Campo de expiración en el carrito

Se agrega expira_at a la tabla carritos. Al crear un carrito se calcula automáticamente sumando 72 horas a la fecha actual. Si el cliente agrega un producto al carrito, el tiempo se renueva.

carritos
├── ...campos actuales...
├── expira_at          ← fecha límite del carrito
└── notificacion_enviada ← para no enviar el email más de una vez

2. Proceso automático en segundo plano

Spring Boot tiene @Scheduled que permite ejecutar métodos automáticamente en intervalos definidos, similar a un cron job. Se crearía un CarritoScheduler que corra por ejemplo cada hora y haga dos cosas:

Primero — Busca carritos activos que falten por ejemplo 24 horas para expirar y que aún no hayan recibido notificación. Les envía el email recordatorio y marca notificacion_enviada = true.

Segundo — Busca carritos activos cuyo expira_at ya pasó. Los vacía y los marca como ABANDONADO.

Cada hora el scheduler revisa:

```
¿Carritos que expiran en menos de 24h y sin notificación?
  → Envía email recordatorio
  → notificacion_enviada = true

¿Carritos cuyo expira_at ya pasó?
  → Vacía items
  → Estado = ABANDONADO
```

3. Envío de emails

Spring Boot tiene Spring Mail que se integra fácilmente con cualquier servidor SMTP. Las opciones más comunes son:

- Gmail SMTP — Gratuito, ideal para desarrollo y proyectos pequeños. Tiene límites de envío diario.

- SendGrid — Tiene plan gratuito generoso, es más robusto para producción y tiene mejor entregabilidad.

- Resend — Más moderno, muy fácil de integrar, buen plan gratuito.

Para este proyecto se recomiendo Gmail SMTP para desarrollo y SendGrid para producción. Es el camino más rápido y sin costo inicial.

## Dependencia necesaria:

Solo se necesita agregar una dependencia a pom.xml:

```
xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

## Configuración en application-dev.properties

```properties
# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Carrito
api.carrito.expiracion-horas=72
api.carrito.notificacion-horas-antes=24
```

> Para Gmail se necesita generar una contraseña de aplicación en una cuenta de Google, no usar la contraseña normal. Esto se hace en Seguridad → Verificación en dos pasos → Contraseñas de aplicación.

## Flujo completo

```
Cliente crea carrito
  → expira_at = ahora + 72h
  → notificacion_enviada = false

Cliente agrega producto
  → expira_at se renueva a ahora + 72h

Scheduler corre cada hora:

  48h después (faltan 24h):
  → Email: "Tienes productos en tu carrito, 
             expira en 24 horas"
  → notificacion_enviada = true

  72h después:
  → Carrito se vacía automáticamente
  → Estado = ABANDONADO
  → Si el cliente vuelve, GET /api/carrito 
    crea uno nuevo vacío automáticamente
```

