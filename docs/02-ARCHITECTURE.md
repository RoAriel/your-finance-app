# 🏗️ Arquitectura del Proyecto

> Entendiendo cómo está organizado el código y por qué

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Arquitectura de NestJS](#arquitectura-de-nestjs)
4. [Patrón de Módulos](#patrón-de-módulos)
5. [Flujo de una Request](#flujo-de-una-request)
6. [Capas de la Aplicación](#capas-de-la-aplicación)
7. [Inyección de Dependencias](#inyección-de-dependencias)
8. [Separación de Concerns](#separación-de-concerns)

---

## 1. Visión General

### Arquitectura de Alto Nivel
```
┌──────────────────────────────────────────────┐
│              Cliente (Postman/Web)            │
└────────────────────┬─────────────────────────┘
                     │ HTTP Requests
                     │ (JSON + JWT Token)
                     ↓
┌──────────────────────────────────────────────┐
│           NestJS Application                  │
│  ┌────────────────────────────────────────┐  │
│  │         Middleware Layer               │  │
│  │  - CORS                                │  │
│  │  - ValidationPipe                      │  │
│  │  - Global Error Handler                │  │
│  └────────────────┬───────────────────────┘  │
│                   ↓                           │
│  ┌────────────────────────────────────────┐  │
│  │         Controllers                    │  │
│  │  - AuthController                      │  │
│  │  - TransactionsController              │  │
│  │  (Manejan HTTP requests/responses)     │  │
│  └────────────────┬───────────────────────┘  │
│                   ↓                           │
│  ┌────────────────────────────────────────┐  │
│  │         Guards                         │  │
│  │  - JwtAuthGuard                        │  │
│  │  (Protegen rutas)                      │  │
│  └────────────────┬───────────────────────┘  │
│                   ↓                           │
│  ┌────────────────────────────────────────┐  │
│  │         Services (Lógica)              │  │
│  │  - AuthService                         │  │
│  │  - TransactionsService                 │  │
│  │  (Business logic)                      │  │
│  └────────────────┬───────────────────────┘  │
│                   ↓                           │
│  ┌────────────────────────────────────────┐  │
│  │         Prisma Service                 │  │
│  │  (Capa de acceso a datos)              │  │
│  └────────────────┬───────────────────────┘  │
└───────────────────┼──────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │   PostgreSQL          │
        │   (Supabase)          │
        └───────────────────────┘
```

---

## 2. Estructura de Carpetas
```
your-finance-app/
├── apps/                           # Aplicaciones del monorepo
│   └── backend/                    # Backend NestJS
│       ├── prisma/                 # Configuración de Prisma
│       │   ├── migrations/         # Historial de migraciones
│       │   └── schema.prisma       # Definición de modelos
│       ├── src/                    # Código fuente
│       │   ├── auth/               # 🔐 Módulo de Autenticación
│       │   │   ├── decorators/     # Decorators personalizados
│       │   │   │   └── current-user.decorator.ts
│       │   │   ├── dto/            # Data Transfer Objects
│       │   │   │   ├── login.dto.ts
│       │   │   │   └── register.dto.ts
│       │   │   ├── guards/         # Guards de protección
│       │   │   │   └── jwt-auth.guard.ts
│       │   │   ├── interfaces/     # Interfaces TypeScript
│       │   │   │   ├── jwt-payload.interface.ts
│       │   │   │   └── user-payload.interface.ts
│       │   │   ├── strategies/     # Estrategias de Passport
│       │   │   │   └── jwt.strategy.ts
│       │   │   ├── auth.controller.ts   # Endpoints de auth
│       │   │   ├── auth.module.ts       # Módulo de auth
│       │   │   └── auth.service.ts      # Lógica de auth
│       │   ├── transactions/       # 💰 Módulo de Transacciones
│       │   │   ├── dto/
│       │   │   │   ├── create-transaction.dto.ts
│       │   │   │   ├── update-transaction.dto.ts
│       │   │   │   └── query-transaction.dto.ts
│       │   │   ├── transactions.controller.ts
│       │   │   ├── transactions.module.ts
│       │   │   └── transactions.service.ts
│       │   ├── prisma/             # 🗄️ Módulo de Prisma
│       │   │   ├── prisma.module.ts
│       │   │   └── prisma.service.ts
│       │   ├── app.controller.ts   # Controller principal
│       │   ├── app.module.ts       # Módulo raíz
│       │   ├── app.service.ts      # Service principal
│       │   └── main.ts             # Entry point
│       ├── test/                   # Tests
│       ├── .env                    # Variables de entorno (no commitear)
│       ├── .env.example            # Template de variables
│       ├── .gitignore              # Archivos ignorados por Git
│       ├── nest-cli.json           # Configuración de NestJS CLI
│       ├── package.json            # Dependencias del backend
│       ├── tsconfig.json           # Configuración TypeScript
│       └── tsconfig.build.json     # Config para build
├── docs/                           # 📚 Documentación
│   ├── 00-INTRODUCTION.md
│   ├── 01-SETUP-GUIDE.md
│   ├── 02-ARCHITECTURE.md
│   └── ...
├── pnpm-workspace.yaml             # Configuración del monorepo
├── package.json                    # Scripts raíz
└── README.md                       # Documentación principal
```

---

## 3. Arquitectura de NestJS

### Principios Fundamentales

NestJS se basa en 3 conceptos principales:

#### 1. **Módulos** (`@Module()`)
Organizan la aplicación en bloques funcionales.
```typescript
@Module({
  imports: [OtroModulo],      // Módulos que necesitamos
  controllers: [MiController], // Controllers de este módulo
  providers: [MiService],      // Services disponibles
  exports: [MiService],        // Services que compartimos
})
export class MiModulo {}
```

#### 2. **Controllers** (`@Controller()`)
Manejan las HTTP requests y responses.
```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() dto: LoginDto) {
    // Manejar login
  }
}
```

#### 3. **Providers** (`@Injectable()`)
Contienen la lógica de negocio.
```typescript
@Injectable()
export class AuthService {
  login(dto: LoginDto) {
    // Lógica de autenticación
  }
}
```

---

## 4. Patrón de Módulos

### Módulo Típico

Cada feature de la app tiene su propio módulo:
```
auth/
├── auth.module.ts        # Define el módulo
├── auth.controller.ts    # Endpoints HTTP
├── auth.service.ts       # Lógica de negocio
├── dto/                  # Validación de datos
├── guards/               # Protección de rutas
├── strategies/           # Estrategias de auth
└── decorators/           # Helpers personalizados
```

### Módulo Global (Prisma)

Algunos módulos se marcan como `@Global()` para estar disponibles en toda la app:
```typescript
@Global()  // ← Disponible en todos los módulos
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### AppModule (Raíz)

El módulo raíz importa todos los demás:
```typescript
@Module({
  imports: [
    PrismaModule,        // Base de datos
    AuthModule,          // Autenticación
    TransactionsModule,  // Transacciones
    // ... más módulos
  ],
})
export class AppModule {}
```

---

## 5. Flujo de una Request

### Ejemplo: Crear una Transacción
```
1. Cliente envía POST /transactions
   ↓
2. NestJS recibe la request
   ↓
3. ValidationPipe valida el body contra CreateTransactionDto
   ↓
4. JwtAuthGuard verifica el token JWT
   ↓
5. JwtStrategy extrae userId del token
   ↓
6. @CurrentUser decorator pone userId en el parámetro
   ↓
7. TransactionsController recibe userId y dto validado
   ↓
8. Controller llama a TransactionsService.create(userId, dto)
   ↓
9. Service valida lógica de negocio
   ↓
10. Service llama a Prisma para guardar en DB
    ↓
11. Prisma ejecuta INSERT en PostgreSQL
    ↓
12. PostgreSQL devuelve el registro creado
    ↓
13. Service devuelve el resultado al Controller
    ↓
14. Controller devuelve JSON al cliente (201 Created)
```

### En Código
```typescript
// 1. Cliente hace request
POST /transactions
Headers: { Authorization: "Bearer token123" }
Body: { type: "expense", amount: 500 }

// 3. DTO valida los datos
class CreateTransactionDto {
  @IsEnum(['income', 'expense'])
  type: string;  // ✅ Válido

  @IsNumber()
  @Min(0.01)
  amount: number;  // ✅ Válido
}

// 4-6. Guard verifica token y extrae user
@UseGuards(JwtAuthGuard)

// 7. Controller recibe datos validados
@Post()
create(@CurrentUser() user, @Body() dto: CreateTransactionDto) {
  return this.service.create(user.id, dto);
}

// 8-10. Service guarda en DB
async create(userId, dto) {
  return this.prisma.transaction.create({
    data: { userId, ...dto }
  });
}

// 14. Response al cliente
{
  "id": "abc123",
  "userId": "user123",
  "type": "expense",
  "amount": 500,
  ...
}
```

---

## 6. Capas de la Aplicación

### Capa de Presentación (Controllers)

**Responsabilidad:** Manejar HTTP (requests/responses)
```typescript
@Controller('transactions')
export class TransactionsController {
  constructor(private service: TransactionsService) {}

  @Get()
  findAll(@CurrentUser() user, @Query() query) {
    return this.service.findAll(user.id, query);
  }
}
```

**NO debe:**
- Contener lógica de negocio
- Acceder directamente a la base de datos
- Hacer cálculos complejos

**SÍ debe:**
- Validar datos (con DTOs)
- Llamar a services
- Devolver respuestas HTTP

### Capa de Lógica (Services)

**Responsabilidad:** Business logic
```typescript
@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: QueryDto) {
    // 1. Construir filtros
    const where = this.buildFilters(userId, query);

    // 2. Consultar DB
    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    // 3. Transformar si es necesario
    return transactions;
  }
}
```

**NO debe:**
- Manejar HTTP directamente
- Conocer sobre requests/responses

**SÍ debe:**
- Validar lógica de negocio
- Coordinar operaciones
- Transformar datos

### Capa de Datos (Prisma)

**Responsabilidad:** Acceso a la base de datos
```typescript
@Injectable()
export class PrismaService extends PrismaClient {
  // Solo operaciones CRUD
  // Sin lógica de negocio
}
```

---

## 7. Inyección de Dependencias

### ¿Qué es?

En lugar de crear dependencias manualmente, NestJS las "inyecta" automáticamente.

### Sin Inyección de Dependencias ❌
```typescript
class TransactionsService {
  // Creamos la dependencia manualmente
  private prisma = new PrismaService();

  // Problemas:
  // - Difícil de testear
  // - Acoplado fuertemente
  // - No reutilizable
}
```

### Con Inyección de Dependencias ✅
```typescript
@Injectable()
class TransactionsService {
  // NestJS inyecta PrismaService automáticamente
  constructor(private prisma: PrismaService) {}

  // Ventajas:
  // - Fácil de testear (inyectar mock)
  // - Desacoplado
  // - Singleton gestionado por NestJS
}
```

### Cómo funciona
```typescript
// 1. Definimos el Provider
@Injectable()
export class PrismaService { }

// 2. Lo registramos en un Module
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

// 3. NestJS lo inyecta donde se necesita
@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}
  // NestJS ve que necesitamos PrismaService
  // Lo busca en los providers disponibles
  // Lo crea (si no existe) o reutiliza (si ya existe)
  // Lo pasa al constructor
}
```

---

## 8. Separación de Concerns

### Principio: Single Responsibility

Cada clase tiene **una sola razón para cambiar**.

#### ✅ Bien Separado
```typescript
// DTO - Solo validación
class CreateTransactionDto {
  @IsNumber()
  amount: number;
}

// Controller - Solo HTTP
@Controller('transactions')
class TransactionsController {
  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.service.create(dto);
  }
}

// Service - Solo lógica de negocio
@Injectable()
class TransactionsService {
  async create(dto) {
    // Validar reglas de negocio
    if (dto.amount > 1000000) {
      throw new BadRequestException('Amount too high');
    }
    // Guardar
    return this.prisma.transaction.create({ data: dto });
  }
}

// Prisma - Solo acceso a datos
class PrismaService {
  // CRUD operations
}
```

#### ❌ Mal Mezclado
```typescript
// TODO mezclado en el Controller
@Controller('transactions')
class TransactionsController {
  @Post()
  async create(@Body() dto: any) {  // Sin validación
    // Validación manual ❌
    if (!dto.amount || dto.amount <= 0) {
      throw new Error('Invalid');
    }

    // Lógica de negocio ❌
    if (dto.amount > 1000000) {
      throw new Error('Too high');
    }

    // Acceso directo a DB ❌
    const result = await db.query('INSERT INTO...');

    // Difícil de testear
    // Difícil de mantener
    // Acoplado
  }
}
```

---

## 🎯 Patrones de Diseño Aplicados

### 1. **Dependency Injection**
Ya explicado arriba.

### 2. **Repository Pattern**
Prisma actúa como repository, abstrayendo el acceso a datos.

### 3. **DTO Pattern**
Objetos que definen la forma de los datos y sus validaciones.

### 4. **Guard Pattern**
Lógica de autorización separada de los controllers.

### 5. **Decorator Pattern**
Añadir funcionalidad sin modificar código existente.
```typescript
@UseGuards(JwtAuthGuard)  // Decorator
@Get('profile')
getProfile() { }
```

### 6. **Strategy Pattern**
Diferentes estrategias de autenticación (JWT, OAuth, etc).
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // Estrategia específica de JWT
}
```

---

## 📊 Diagrama de Dependencias
```
AppModule
  ├─→ PrismaModule (Global)
  │     └─→ PrismaService
  │
  ├─→ AuthModule
  │     ├─→ AuthController
  │     ├─→ AuthService
  │     │     └─→ PrismaService (inyectado)
  │     ├─→ JwtStrategy
  │     │     └─→ PrismaService (inyectado)
  │     └─→ JwtModule (Global)
  │
  └─→ TransactionsModule
        ├─→ TransactionsController
        │     └─→ TransactionsService (inyectado)
        └─→ TransactionsService
              └─→ PrismaService (inyectado)
```

---

## 🔄 Ciclo de Vida de la Aplicación
```
1. main.ts ejecuta bootstrap()
   ↓
2. NestFactory.create(AppModule)
   ↓
3. NestJS escanea AppModule
   ↓
4. Resuelve imports (PrismaModule, AuthModule, etc)
   ↓
5. Instancia providers (Services)
   ↓
6. Inyecta dependencias
   ↓
7. Ejecuta lifecycle hooks (onModuleInit)
   ↓
8. Registra controllers y routes
   ↓
9. app.listen(3000)
   ↓
10. Aplicación lista para recibir requests
```

---

## 🎓 Conceptos Clave para Recordar

1. **Módulos organizan features**
2. **Controllers manejan HTTP**
3. **Services contienen lógica**
4. **Prisma maneja datos**
5. **Guards protegen rutas**
6. **DTOs validan inputs**
7. **Decorators añaden funcionalidad**
8. **DI gestiona dependencias**

---

## 🚀 Próximos Pasos

Ahora que entendés la arquitectura:

1. **[Estudiar la Base de Datos →](./03-DATABASE.md)**
2. **[Profundizar en Auth →](./04-AUTHENTICATION.md)**
3. **[Explorar Transactions →](./05-TRANSACTIONS.md)**

---

<p align="center">
  <strong>Arquitectura clara = Código mantenible 🏗️</strong>
</p>
