# Ecommerce JEPLabs - Frontend

- Frontend de la aplicación de comercio electrónico JEPLAbs desarrollado con [Vite](https://vitejs.dev/), [React](https://reactjs.org/), [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5) y [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS3).

- Importante: El proyecto se ha migrado a [pnpm](https://pnpm.io/) para mejorar la experiencia de desarrollo y la seguridad.

## Requisitos
- Node.js 16.x o superior
- pnpm 6.x o superior
- *Idealmente versiones actualizadas y LTS (Long Term Support).

## 1. Instalación de pnpm

#### Opción A: Windows (Chocolatey) - Recomendado si usas Maven con Choco

```powershell
# Ejecutar PowerShell como Administrador
choco install pnpm -y
```

#### Opción B: Script Standalone (Multiplataforma)

Ideal si no tienes permisos de administrador o prefieres una instalación aislada en tu usuario.

```powershell
# PowerShell:
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

```bash
# macOS / Linux / Git Bash:
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

Después de instalar, reinicia tu terminal o ejecuta source ~/.bashrc (o el equivalente en tu shell).

#### Opción C: Corepack (Nativo en Node.js)
Si prefieres usar la versión gestionada por Node:

```bash
corepack enable pnpm
```

## 2. Migración / Instalación de Dependencias
Si el proyecto venía de npm, elimina los archivos antiguos antes de instalar:

```bash
# Eliminar rastros de npm
rm -rf node_modules package-lock.json

# Instalar con pnpm (generará pnpm-lock.yaml)
pnpm install
```

En caso de *ERR_PNPM_IGNORED_BUILDS* por EsBuild, aprobar dependencias ejecutando:
```bash
pnpm approve-builds
# Seleccionar con barra espaciadora + enter
```

## 3. Ejecutar el frontend:

```bash
pnpm run dev
# O el script definido en tu package.json, ej: pnpm start
```
Comprobar que la aplicación está corriendo en:
```bash
localhost:5173
```

Para realizar cambios en el frontend, debes ejecutar el comando. Esto iniciará un servidor de desarrollo en el puerto 5173 y actualizará automáticamente la página cuando se hagan cambios en los archivos.