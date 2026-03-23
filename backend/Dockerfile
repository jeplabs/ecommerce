# ================================
# ETAPA 1: Build
# ================================
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Copia primero solo el pom.xml para aprovechar cache de Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia el código fuente y construye el JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ================================
# ETAPA 2: Runtime
# ================================
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copia solo el JAR generado en la etapa anterior
COPY --from=builder /app/target/*.jar app.jar

# Puerto que expone la app
EXPOSE 8080

# Perfil de producción + ejecuta el JAR
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
