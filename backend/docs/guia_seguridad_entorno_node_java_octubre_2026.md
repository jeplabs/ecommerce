# Guía de Seguridad y Actualización de Entorno (Node.js & Java/OpenJDK - Octubre 2026)

Este documento detalla el análisis de vulnerabilidades críticas y parches de seguridad publicados en **octubre de 2026** que afectan a los entornos de desarrollo y ejecución de **Node.js** y **Java / OpenJDK**, así como los pasos y alternativas para que todos los desarrolladores del equipo mantengan sus estaciones de trabajo y servidores protegidos.

---

## 1. Resumen de Vulnerabilidades Críticas (Octubre 2026)

### A. Node.js — Vulnerabilidad Crítica en Brotli (`.br`) y Red
El **21 de octubre de 2026**, el equipo de seguridad de Node.js publicó una actualización de seguridad urgente que cubre varias vulnerabilidades de alta severidad:

1. **CVE-2026-111497 (Brotli Out-of-Bounds Write / "Node2Shell" — CVSS 9.2 Crítica):**
   * **Descripción:** Desbordamiento de búfer y escritura fuera de límites en la biblioteca nativa de descompresión Brotli empaquetada dentro del binario de Node.js (`node:zlib` y `fetch`).
   * **Vector de ataque:** Ocurre al procesar o descomprimir cargas útiles HTTP maliciosas codificadas en `Content-Encoding: br`.
   * **Impacto:** Denegación de servicio (DoS) o potencial **Ejecución Remota de Código (RCE)** sin autenticación previa.
2. **CVE-2026-105482 (DNS NUL Byte Truncation — Alta):** Truncamiento indebido de nombres de host con bytes NUL en `dns.resolve*()` y `dns.reverse()`, permitiendo eludir listas blancas de dominios.
3. **CVE-2026-105483 (TLS Hostname Verification Bypass — Alta):** Omisión de la validación de certificados TLS cuando las direcciones IP utilizan números no ASCII (fullwidth digits).

* **Versiones mínimas seguras de Node.js:**
  * **Rama 24.x (LTS):** `v24.22.1` o superior.
  * **Rama 22.x (LTS):** `v22.23.4` o superior.
  * **Rama 26.x (Current):** `v26.12.1` o superior.
  * *(Nota: Versiones EOL como Node 18 o 20 ya no reciben parches y son vulnerables).*

---

### B. Java / OpenJDK — Oracle Critical Patch Update (CPU Octubre 2026)
El **20 de octubre de 2026**, Oracle y el OpenJDK Vulnerability Group publicaron el CPU trimestral con **53 correcciones de seguridad** acumulativas:

* **Componentes afectados:** Capas de transporte y cifrado TLS, procesamiento de XML (`javax.xml` / JAXP contra ataques XXE y DoS por recursión), autenticación Kerberos y optimizaciones del compilador JIT.
* **Impacto:** Exposición de información, bypass de validación criptográfica y degradación de rendimiento por deserialización maliciosa.
* **Versiones objetivo con parches aplicados:**
  * Para **Java 25 (LTS):** Eclipse Temurin / Corretto `25.0.4.1` / `25.0.5` o posterior.
  * Para **Java 21 (LTS):** `21.0.12.1` o posterior.
  * Para **Java 17 (LTS):** `17.0.20.1` o posterior.

---

## 2. Diagnóstico del Proyecto

| Componente | Versión en el Proyecto / Entorno | Estado | Acción Requerida |
| :--- | :--- | :--- | :--- |
| **Node.js Runtime** | `v24.22.1` | 🟢 **SEGURO** | Ninguna. La versión actual ya tiene el parche para Brotli (CVE-2026-111497) y DNS/TLS. |
| **JDK (Host Dev)** | `Eclipse Temurin 25.0.4.1+1` | 🟢 **SEGURO** | Actualizado con los parches acumulativos de seguridad (Octubre 2026). |
| **Backend Spring Boot** | `4.0.3` (Java 21 target) | 🟢 **SEGURO** | El proyecto compila sobre Spring Boot 4.0.3 con target Java 21 moderno. |
| **Frontend Tooling (Vite)** | Rama 7 parcheada (`^7.3.7`) | 🟢 **SEGURO** | Mantenerse en la rama 7 con versión `>= 7.3.5` para evitar breaking changes de Vite 8. |

---

## 3. Guía Paso a Paso para Desarrolladores

### Paso 1: Verificar tus versiones actuales
Abre una terminal (PowerShell o Bash) y revisa:
```bash
node -v
java -version
```

---

### Paso 2: Actualizar Node.js (Si tienes versión anterior a 24.22.1 o 22.23.4)

#### Opción A: Usando PNPM (`pnpm env` - Recomendado si usas PNPM)
PNPM incluye su propio gestor de versiones de Node.js integrado, sin necesidad de instalar NVM ni FNM:
```bash
# Instalar y activar Node 24 (LTS segura con parche Brotli):
pnpm env use --global 24.22.1

# O la última LTS segura de Node 24:
pnpm env use --global lts

# Verificar versiones instaladas gestionadas por pnpm:
pnpm env list
```

#### Opción B: Usando NVM para Windows / NVM
```bash
# Para NVM Windows:
nvm install 24.22.1
nvm use 24.22.1

# O si utilizas la rama LTS anterior (22.x):
nvm install 22.23.4
nvm use 22.23.4
```

#### Opción C: Usando FNM (Fast Node Manager)
```bash
fnm install 24
fnm default 24
```

#### Opción D: Instalador directo
Descarga el instalador oficial más reciente desde [nodejs.org](https://nodejs.org/es).

---

### Paso 3: Actualizar Java en tu Entorno y para el Proyecto

Dado que Temurin `25.0.1+8` data de octubre de 2025, se debe actualizar el JDK del sistema para incorporar los parches del CPU de Octubre 2026.

#### 3.1. Actualización en tu Entorno Local (Windows)

##### Opción A: Usando Chocolatey en PowerShell (Si tienes `choco` instalado)
Si `winget` no está disponible en tu Windows, tu sistema cuenta con **Chocolatey**:
1. Abre PowerShell como Administrador.
2. Ejecuta:
   ```powershell
   choco upgrade temurin25 -y
   ```
   *(O si prefieres la versión LTS 21: `choco upgrade temurin21 -y`)*.
3. Cierra y vuelve a abrir PowerShell para refrescar variables de entorno.
4. Verifica con:
   ```powershell
   java -version
   ```

##### Opción B: Instalador oficial `.msi` (Manual y 100% universal)
1. Ingresa a [Adoptium Releases (Eclipse Temurin)](https://adoptium.net/temurin/releases/?version=25).
2. Selecciona **Operating System: Windows**, **Architecture: x64** y **Package Type: JDK**.
3. Descarga el archivo `.msi` más reciente.
4. Al instalar, asegúrate de marcar las opciones:
   * **Set JAVA_HOME variable**
   * **Add to PATH**
5. Abre una nueva terminal y verifica con `java -version`.

##### Opción C: Usando Winget (Requiere "Instalador de la aplicación" de Microsoft Store)
*(Si `winget` no es reconocido, instala primero "App Installer" desde Microsoft Store)*:
```powershell
winget upgrade EclipseAdoptium.Temurin.25.JDK
```

##### Opción C: Para Linux / macOS / WSL (vía SDKMAN)
```bash
sdk update
sdk list java
sdk install java 25.0.5-tem
sdk default java 25.0.5-tem
```

#### 3.2. Configuración en el Proyecto (`backend/pom.xml`)

* **¿Es necesario cambiar `pom.xml` al actualizar el JDK?**
  * **No obligatoriamente.** En `backend/pom.xml` está configurado:
    ```xml
    <properties>
        <java.version>21</java.version>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>
    ```
  * `java.version = 21` representa el **nivel de compatibilidad de bytecode** (LTS estándar). Al tener instalado JDK 25 en tu entorno local, el compilador Maven compila con bandera `--release 21`, asegurando compatibilidad binaria perfecta mientras aprovecha las optimizaciones y parches del compilador moderno.
  * **Si el equipo decide unificar el target del proyecto a Java 25:**
    Basta con cambiar la propiedad en [`backend/pom.xml`](file:///d:/Programación/ecommerce/backend/pom.xml#L30):
    ```xml
    <java.version>25</java.version>
    <maven.compiler.source>25</maven.compiler.source>
    <maven.compiler.target>25</maven.compiler.target>
    ```

---

### Paso 4: Actualizar Dependencias del Frontend (Vite)

Para mitigar la vulnerabilidad en Windows de Vite (`GHSA-fx2h-pf6j-xcff` — bypass de `server.fs.deny`):

> [!WARNING]
> Ejecutar `pnpm update vite` sin especificar versión intentará saltar a **Vite 8**, que reemplaza Rollup por Rolldown y causa errores de compilación con la sintaxis de objeto de `manualChunks`. La forma recomendada es actualizar dentro de la rama **Vite 7**:

1. Navegar a la carpeta frontend:
   ```bash
   cd frontend
   ```
2. Instalar la última versión estable parchada de la rama 7:
   ```bash
   pnpm add -D vite@^7.3.7
   ```
3. Ejecutar compilación y tests para validar:
   ```bash
   pnpm build
   npx vitest run
   ```

---

## 5. Alternativa para Equipos: Contenedores Dev Container / Docker

Para evitar divergencias de parches y versiones entre diferentes sistemas operativos de los miembros del equipo:
* Se recomienda utilizar **Dev Containers** (`.devcontainer/devcontainer.json`) o imágenes Docker fijadas a etiquetas parcheadas:
  * Backend: `eclipse-temurin:21-jdk-alpine` (con recreación periódica de imagen).
  * Frontend: `node:24.22.1-alpine`.
