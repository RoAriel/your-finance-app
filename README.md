# 💰 Your Finance App

> Una aplicación profesional de finanzas personales construida con tecnologías modernas. Proyecto educativo diseñado para enseñar desarrollo full-stack con NestJS, Prisma y PostgreSQL.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 🎯 Sobre el Proyecto

**Your Finance App** es una aplicación de gestión de finanzas personales que permite:

- ✅ Registrar ingresos y gastos
- ✅ Categorizar transacciones
- ✅ Soportar múltiples monedas (ARS, USD, EUR)
- ✅ Calcular balance automáticamente
- ✅ Filtrar por fechas, tipos y categorías
- ✅ Autenticación segura con JWT
- ✅ Soft delete para mantener historial

### 🎓 Objetivo Educativo

Este proyecto fue diseñado para **enseñar desarrollo backend profesional** con:
- Arquitectura modular escalable
- Patrones de diseño modernos
- Buenas prácticas de TypeScript
- Testing y validaciones
- Documentación completa

---

## 🛠️ Stack Tecnológico

### Backend
- **[NestJS](https://nestjs.com/)** - Framework progresivo de Node.js
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safety en todo el código
- **[Prisma](https://www.prisma.io/)** - ORM moderno con migraciones
- **[PostgreSQL](https://www.postgresql.org/)** - Base de datos relacional
- **[Supabase](https://supabase.com/)** - PostgreSQL hosteado

### Autenticación & Seguridad
- **[Passport JWT](https://www.passportjs.org/)** - Estrategia de autenticación
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Hash de passwords
- **[class-validator](https://github.com/typestack/class-validator)** - Validación de DTOs

### Herramientas
- **[pnpm](https://pnpm.io/)** - Gestor de paquetes eficiente
- **[ESLint](https://eslint.org/)** - Linting de código
- **[Prettier](https://prettier.io/)** - Formateo automático

---

## 🚀 Quick Start

### Prerrequisitos

```bash
# Node.js v18+ y pnpm
node --version  # v18.0.0 o superior
npm install -g pnpm
```

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/RoAriel/your-finance-app.git
cd your-finance-app

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp apps/backend/.env.example apps/backend/.env
# Editar .env con tus credenciales de Supabase

# 4. Ejecutar migraciones
cd apps/backend
npx prisma migrate dev

# 5. Iniciar servidor de desarrollo
pnpm dev:backend
```

**El servidor estará corriendo en:** `http://localhost:3000`

---

## 📖 Documentación Completa

📚 **[Ver documentación completa en /docs](./docs/)**

### Guías paso a paso:

1. **[Introducción](./docs/00-INTRODUCTION.md)** - ¿Qué es este proyecto y qué aprenderás?
2. **[Setup Guide](./docs/01-SETUP-GUIDE.md)** - Instalación detallada desde cero
3. **[Arquitectura](./docs/02-ARCHITECTURE.md)** - Estructura y diseño del proyecto
4. **[Base de Datos](./docs/03-DATABASE.md)** - Modelos, relaciones e índices
5. **[Autenticación](./docs/04-AUTHENTICATION.md)** - Sistema de Auth con JWT
6. **[Transacciones](./docs/05-TRANSACTIONS.md)** - Módulo principal explicado
7. **[API Reference](./docs/06-API-REFERENCE.md)** - Todos los endpoints documentados
8. **[Conceptos](./docs/07-CONCEPTS.md)** - Conceptos técnicos en detalle
9. **[Best Practices](./docs/08-BEST-PRACTICES.md)** - Mejores prácticas aplicadas

---

## 🔌 API Endpoints

### Authentication

```http
POST   /auth/register      # Crear cuenta
POST   /auth/login         # Iniciar sesión
GET    /auth/profile       # Ver perfil (protegido)
```

### Transactions

```http
POST   /transactions           # Crear transacción
GET    /transactions           # Listar (con filtros)
GET    /transactions/balance   # Ver balance
GET    /transactions/:id       # Ver detalle
PATCH  /transactions/:id       # Actualizar
DELETE /transactions/:id       # Eliminar (soft)
```

**[Ver documentación completa de la API →](./docs/06-API-REFERENCE.md)**

---

## 📊 Estructura del Proyecto

```
your-finance-app/
├── apps/
│   └── backend/              # Aplicación NestJS
│       ├── prisma/           # Schema y migraciones
│       ├── src/
│       │   ├── auth/         # Módulo de autenticación
│       │   ├── transactions/ # Módulo de transacciones
│       │   └── prisma/       # Módulo de Prisma
│       └── test/             # Tests
├── docs/                     # Documentación completa
├── pnpm-workspace.yaml       # Configuración monorepo
└── package.json              # Scripts principales
```

---

## 🧪 Testing

### Probar con cURL

```bash
# Registro
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Crear transacción (usar token del login)
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"type":"expense","amount":500,"description":"Test"}'
```

### Probar con Postman

Importá la colección de Postman (próximamente) o usa los endpoints documentados.

---

## 🎓 ¿Qué aprenderás?

### Conceptos de Backend
- ✅ Arquitectura modular con NestJS
- ✅ Inyección de dependencias
- ✅ Guards y decorators personalizados
- ✅ Manejo de errores y excepciones
- ✅ Validación de datos con DTOs

### Base de Datos
- ✅ Diseño de schema relacional
- ✅ Migraciones con Prisma
- ✅ Relaciones entre modelos
- ✅ Índices para performance
- ✅ Soft delete pattern

### Seguridad
- ✅ Autenticación con JWT
- ✅ Hash de passwords con bcrypt
- ✅ Protección de rutas
- ✅ Autorización por usuario
- ✅ Validación de inputs

### TypeScript Avanzado
- ✅ Tipos estrictos
- ✅ Interfaces y DTOs
- ✅ Generics
- ✅ Decorators
- ✅ Type-safety end-to-end

---

## 🗺️ Roadmap

### ✅ Fase 1 - Completado
- [x] Setup del proyecto
- [x] Autenticación JWT
- [x] CRUD de transacciones
- [x] Filtros y balance

### 🚧 Fase 2 - En progreso
- [ ] Módulo de categorías
- [ ] Cuentas de ahorro
- [ ] Tarjetas de crédito con cuotas

### 📅 Fase 3 - Planificado
- [ ] Reportes mensuales/anuales
- [ ] Exportación a Excel
- [ ] Gráficos y estadísticas
- [ ] Frontend con React

---

## 🤝 Contribuir

¿Querés contribuir al proyecto? ¡Genial!

1. Fork el repositorio
2. Creá una branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abrí un Pull Request

**[Ver guía de contribución completa →](./.github/CONTRIBUTING.md)**

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la [MIT License](LICENSE).

---

## 👨‍💻 Autor

**Ariel Roldan**
- GitHub: [@RoAriel](https://github.com/RoAriel)

---

## 🙏 Agradecimientos

- [NestJS](https://nestjs.com/) por el increíble framework
- [Prisma](https://www.prisma.io/) por el mejor ORM de TypeScript
- [Supabase](https://supabase.com/) por PostgreSQL gratis

---

<p align="center">
  Hecho con ❤️ y ☕ como proyecto educativo
</p>
