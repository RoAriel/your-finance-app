# 🛠️ Guía de Instalación - Setup Completo

> Instalación paso a paso desde cero. No asumimos conocimientos previos.

---

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Instalación de Herramientas](#instalación-de-herramientas)
3. [Clonar el Proyecto](#clonar-el-proyecto)
4. [Configurar Supabase](#configurar-supabase)
5. [Variables de Entorno](#variables-de-entorno)
6. [Instalación de Dependencias](#instalación-de-dependencias)
7. [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
8. [Iniciar el Servidor](#iniciar-el-servidor)
9. [Verificación](#verificación)
10. [Troubleshooting](#troubleshooting)

---

## 1. Prerrequisitos

### Sistema Operativo

- Linux (Ubuntu, Debian, etc.)
- macOS
- Windows (con WSL2 recomendado)

### Software Necesario

- **Node.js** v18 o superior
- **Git**
- **Editor de código** (VSCode recomendado)
- **Cliente HTTP** (Postman, Thunder Client, o curl)

---

## 2. Instalación de Herramientas

### 2.1 Instalar Node.js

**Ubuntu/Debian:**
```bash
# Usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v18.x.x o superior
npm --version
```

**macOS:**
```bash
# Usando Homebrew
brew install node@18

# Verificar instalación
node --version
npm --version
```

**Windows:**
- Descargar desde [nodejs.org](https://nodejs.org/)
- Ejecutar el instalador
- Reiniciar la terminal
- Verificar: `node --version`

### 2.2 Instalar pnpm
```bash
npm install -g pnpm

# Verificar instalación
pnpm --version  # Debe mostrar 8.x.x o superior
```

**¿Por qué pnpm?**
- Más rápido que npm
- Ahorra espacio en disco
- Gestión de monorepos integrada

### 2.3 Instalar Git

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install git
```

**macOS:**
```bash
brew install git
```

**Windows:**
- Descargar desde [git-scm.com](https://git-scm.com/)

**Verificar:**
```bash
git --version
```

### 2.4 Instalar VSCode (Recomendado)

Descargar desde [code.visualstudio.com](https://code.visualstudio.com/)

**Extensiones recomendadas:**
- Prisma (Prisma.prisma)
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Thunder Client (rangav.vscode-thunder-client)

---

## 3. Clonar el Proyecto

### 3.1 Clonar desde GitHub
```bash
# Crear carpeta para tus proyectos
mkdir -p ~/dev
cd ~/dev

# Clonar el repositorio
git clone https://github.com/RoAriel/your-finance-app.git
cd your-finance-app
```

### 3.2 Explorar la estructura
```bash
# Ver estructura del proyecto
ls -la

# Deberías ver:
# - apps/backend/
# - docs/
# - pnpm-workspace.yaml
# - package.json
# - README.md
```

---

## 4. Configurar Supabase

Supabase nos proporciona PostgreSQL gratis en la nube.

### 4.1 Crear cuenta en Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Click en "Start your project"
3. Sign up con GitHub (recomendado)

### 4.2 Crear nuevo proyecto

1. Click en "New Project"
2. Completar los datos:
   - **Name:** `your-finance-app`
   - **Database Password:** (guarda esta contraseña)
   - **Region:** Elegir el más cercano (ej: `South America (São Paulo)`)
   - **Pricing Plan:** Free
3. Click en "Create new project"
4. Esperar ~2 minutos mientras se crea

### 4.3 Obtener connection strings

1. Ir a **Settings** (⚙️) → **Database**
2. Buscar la sección **Connection string**
3. Seleccionar **URI** en el dropdown

**Verás dos modos:**

**Session mode (puerto 5432):**
```
postgresql://postgres.xxxxx:PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

**Transaction mode (puerto 6543):**
```
postgresql://postgres.xxxxx:PASSWORD@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Guardalas, las necesitaremos en el próximo paso.**

---

## 5. Variables de Entorno

### 5.1 Copiar archivo de ejemplo
```bash
cd apps/backend
cp .env.example .env
```

### 5.2 Editar .env

Abrir `apps/backend/.env` y completar:
```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
# Transaction mode (puerto 6543) - Para queries normales
DATABASE_URL="postgresql://postgres.xxxxx:TU_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session mode (puerto 5432) - Para migraciones
DIRECT_URL="postgresql://postgres.xxxxx:TU_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

# ===========================================
# JWT CONFIGURATION
# ===========================================
# Generar un secret seguro con:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="tu-secret-generado-aleatorio-muy-largo"

# Expiración del token
JWT_EXPIRES_IN="7d"
```

**⚠️ IMPORTANTE:**
- Reemplazar `xxxxx` con tu project ID
- Reemplazar `TU_PASSWORD` con la contraseña de Supabase
- Generar un `JWT_SECRET` aleatorio (comando arriba)

### 5.3 Generar JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ejemplo de output:
# a3d8f9e2b1c4567890abcdef1234567890abcdef1234567890abcdef123456

# Copiar ese string al .env en JWT_SECRET
```

### 5.4 Verificar .env
```bash
# Ver el contenido (sin mostrar passwords completas)
cat .env | sed 's/:.*@/:****@/'

# Debería mostrar las URLs con **** en lugar de la password
```

---

## 6. Instalación de Dependencias

### 6.1 Instalar desde la raíz
```bash
# Volver a la raíz del proyecto
cd ~/dev/your-finance-app

# Instalar todas las dependencias del monorepo
pnpm install
```

Esto instalará:
- Dependencias del backend
- Dependencias compartidas
- Herramientas de desarrollo

**Tiempo estimado:** 1-3 minutos dependiendo de tu conexión.

### 6.2 Verificar instalación
```bash
# Ver dependencias instaladas
ls -la node_modules/
ls -la apps/backend/node_modules/

# Ver scripts disponibles
cat package.json | grep scripts -A 5
```

---

## 7. Migraciones de Base de Datos

Las migraciones crean las tablas en PostgreSQL.

### 7.1 Generar Prisma Client
```bash
cd apps/backend
npx prisma generate
```

**Esto genera:** Código TypeScript tipado basado en tu schema.

### 7.2 Ejecutar migraciones
```bash
npx prisma migrate deploy
```

**¿Qué hace esto?**
- Lee el schema de Prisma
- Genera SQL para crear tablas
- Ejecuta el SQL en Supabase
- Crea las tablas: `users`, `transactions`, `categories`

**Output esperado:**
```
Applying migration `20260104185727_init`
Applying migration `20260109000725_add_transactions_and_categories`

The following migration(s) have been applied:

migrations/
  └─ 20260104185727_init/
    └─ migration.sql
  └─ 20260109000725_add_transactions_and_categories/
    └─ migration.sql
```

### 7.3 Verificar en Supabase

1. Ir a Supabase → **Table Editor**
2. Deberías ver 3 tablas:
   - ✅ `users`
   - ✅ `transactions`
   - ✅ `categories`

---

## 8. Iniciar el Servidor

### 8.1 Modo desarrollo
```bash
# Desde la raíz del proyecto
pnpm dev:backend

# O desde apps/backend/
pnpm run start:dev
```

**Output esperado:**
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] PrismaModule dependencies initialized
[Nest] LOG [InstanceLoader] AuthModule dependencies initialized
[Nest] LOG [InstanceLoader] TransactionsModule dependencies initialized
[Nest] LOG [RoutesResolver] AppController {/}:
[Nest] LOG [RouterExplorer] Mapped {/, GET} route
[Nest] LOG [RoutesResolver] AuthController {/auth}:
[Nest] LOG [RouterExplorer] Mapped {/auth/register, POST} route
[Nest] LOG [RouterExplorer] Mapped {/auth/login, POST} route
[Nest] LOG [RouterExplorer] Mapped {/auth/profile, GET} route
[Nest] LOG [RoutesResolver] TransactionsController {/transactions}:
[Nest] LOG [RouterExplorer] Mapped {/transactions, POST} route
[Nest] LOG [RouterExplorer] Mapped {/transactions, GET} route
[Nest] LOG [RouterExplorer] Mapped {/transactions/balance, GET} route
[Nest] LOG [NestApplication] Nest application successfully started
```

**El servidor está corriendo en:** `http://localhost:3000`

---

## 9. Verificación

### 9.1 Probar con el navegador

Abrir en tu navegador:
```
http://localhost:3000
```

Deberías ver:
```json
"Hello World!"
```

### 9.2 Probar Auth con curl

**Registro:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Respuesta esperada:**
```json
{
  "user": {
    "id": "uuid...",
    "email": "test@example.com",
    "name": "Test User"
  },
  "token": "eyJhbGc..."
}
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 9.3 Probar Transactions

**Primero, guardar el token:**
```bash
TOKEN="eyJhbGc..."  # Copiar del login
```

**Crear transacción:**
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "expense",
    "amount": 500,
    "description": "Test de setup"
  }'
```

**Listar transacciones:**
```bash
curl http://localhost:3000/transactions \
  -H "Authorization: Bearer $TOKEN"
```

---

## 10. Troubleshooting

### Error: "Cannot find module '@nestjs/core'"

**Solución:**
```bash
cd apps/backend
pnpm install
```

### Error: "Environment variable not found: DATABASE_URL"

**Solución:**
- Verificar que `.env` existe en `apps/backend/`
- Verificar que tiene `DATABASE_URL` configurado
- Reiniciar el servidor

### Error: "connect ECONNREFUSED"

**Problema:** No puede conectar a la base de datos.

**Solución:**
1. Verificar que las URLs de Supabase son correctas
2. Verificar que la contraseña es correcta
3. Verificar que no hay espacios extras en el `.env`

### Error: "Table 'users' does not exist"

**Problema:** Las migraciones no se aplicaron.

**Solución:**
```bash
cd apps/backend
npx prisma migrate deploy
```

### Error: "Port 3000 is already in use"

**Problema:** Otro proceso está usando el puerto 3000.

**Solución:**
```bash
# Ver qué está usando el puerto
lsof -i :3000

# Matar el proceso
kill -9 PID

# O cambiar el puerto en main.ts
await app.listen(3001);  # Usar otro puerto
```

### El servidor se reinicia constantemente

**Problema:** Archivo con sintaxis incorrecta.

**Solución:**
- Ver los errores en la consola
- Corregir el archivo mencionado
- El servidor se reiniciará automáticamente

### Warnings de ESLint molestos

**Solución temporal:**
Ver [08-BEST-PRACTICES.md](./08-BEST-PRACTICES.md#configurar-eslint) para configurar ESLint.

---

## ✅ Checklist Final

Antes de continuar, verificá que:

- [ ] Node.js v18+ instalado
- [ ] pnpm instalado globalmente
- [ ] Proyecto clonado
- [ ] Cuenta de Supabase creada
- [ ] `.env` configurado correctamente
- [ ] Dependencias instaladas (`pnpm install`)
- [ ] Migraciones aplicadas
- [ ] Servidor corriendo sin errores
- [ ] Endpoint `/` responde "Hello World!"
- [ ] Auth funciona (registro y login)
- [ ] Transactions funciona

---

## 🎉 ¡Felicitaciones!

Si todo funcionó, ya tenés el proyecto corriendo localmente.

**Próximos pasos:**

1. **[Entender la Arquitectura →](./02-ARCHITECTURE.md)**
2. **[Explorar la Base de Datos →](./03-DATABASE.md)**
3. **[Estudiar Autenticación →](./04-AUTHENTICATION.md)**

---

## 💾 Comandos Útiles de Referencia
```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev:backend

# Generar Prisma Client
npx prisma generate

# Crear nueva migración
npx prisma migrate dev --name nombre_de_la_migracion

# Ver base de datos en el navegador
npx prisma studio

# Formatear código
pnpm run format

# Linting
pnpm run lint

# Build para producción
pnpm run build
```

---

<p align="center">
  <strong>Setup completado ✅</strong><br>
  Ahora sí, a programar 🚀
</p>
