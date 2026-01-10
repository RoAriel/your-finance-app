# 🧠 Conceptos Técnicos Profundos

> Entendiendo los fundamentos detrás del código

---

## 📋 Tabla de Contenidos

1. [TypeScript Avanzado](#typescript-avanzado)
2. [Decorators](#decorators)
3. [Dependency Injection](#dependency-injection)
4. [Promises y Async/Await](#promises-y-asyncawait)
5. [Error Handling](#error-handling)
6. [Seguridad](#seguridad)
7. [Performance](#performance)

---

## 1. TypeScript Avanzado

### Tipos vs Interfaces

**Interface:**
```typescript
interface User {
  id: string;
  email: string;
  name?: string;  // Opcional
}

// Extender
interface AdminUser extends User {
  role: 'admin';
}
```

**Type:**
```typescript
type User = {
  id: string;
  email: string;
  name?: string;
}

// Combinar
type AdminUser = User & {
  role: 'admin';
}
```

**¿Cuándo usar cada uno?**
- **Interface:** Para objetos, clases, contratos
- **Type:** Para unions, intersections, primitivos

### Generics
```typescript
// Sin generics (malo)
function getFirst(arr: any[]): any {
  return arr[0];
}

// Con generics (bueno)
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

const first = getFirst<number>([1, 2, 3]);  // first es number
const name = getFirst<string>(['a', 'b']);  // name es string
```

**En Prisma:**
```typescript
// Prisma genera tipos genéricos automáticamente
type User = Prisma.UserGetPayload<{
  include: { transactions: true }
}>
// User incluye transactions tipadas
```

### Utility Types
```typescript
// Partial - Hace todos los campos opcionales
type UpdateUserDto = Partial<CreateUserDto>;

// Pick - Selecciona campos específicos
type LoginDto = Pick<User, 'email' | 'password'>;

// Omit - Excluye campos
type UserResponse = Omit<User, 'password'>;

// Required - Hace todos los campos requeridos
type RequiredUser = Required<User>;

// Record - Objeto con keys de un tipo y values de otro
type UserMap = Record<string, User>;
```

### Type Guards
```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processValue(value: string | number) {
  if (isString(value)) {
    // TypeScript sabe que value es string acá
    value.toUpperCase();
  } else {
    // Y acá sabe que es number
    value.toFixed(2);
  }
}
```

---

## 2. Decorators

### ¿Qué son los Decorators?

Son funciones que **modifican** clases, métodos, propiedades o parámetros.
```typescript
function MyDecorator(target: any) {
  // Modificar o agregar funcionalidad
}

@MyDecorator
class MyClass {}
```

### Class Decorators
```typescript
@Injectable()  // Marca la clase como inyectable
export class AuthService {}

@Controller('auth')  // Define el prefijo de ruta
export class AuthController {}

@Module({})  // Define un módulo de NestJS
export class AuthModule {}
```

### Method Decorators
```typescript
@Post('register')  // Define método HTTP y ruta
register() {}

@Get('profile')
@UseGuards(JwtAuthGuard)  // Aplica guard
getProfile() {}

@HttpCode(201)  // Define código de respuesta
create() {}
```

### Parameter Decorators
```typescript
login(
  @Body() dto: LoginDto,           // Extrae body
  @Param('id') id: string,         // Extrae param de URL
  @Query('page') page: number,     // Extrae query param
  @Headers('authorization') auth,  // Extrae header
  @CurrentUser() user: User        // Custom decorator
) {}
```

### Property Decorators (DTOs)
```typescript
class CreateTransactionDto {
  @IsEnum(['income', 'expense'])  // Validación
  type: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  description?: string;
}
```

### Custom Decorator
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Uso
@Get('profile')
getProfile(@CurrentUser() user: User) {
  console.log(user.id);
}
```

---

## 3. Dependency Injection

### El Problema
```typescript
// ❌ Sin DI - Acoplamiento fuerte
class TransactionsService {
  private prisma = new PrismaService();  // Hard-coded

  // Problemas:
  // - No puedo cambiar implementación
  // - Difícil de testear
  // - Múltiples instancias innecesarias
}
```

### La Solución: DI
```typescript
// ✅ Con DI - Desacoplamiento
@Injectable()
class TransactionsService {
  constructor(private prisma: PrismaService) {}

  // Ventajas:
  // - NestJS gestiona instancias
  // - Fácil de testear (inyectar mocks)
  // - Singleton automático
}
```

### Cómo Funciona
```typescript
// 1. Definir Provider
@Injectable()
export class PrismaService extends PrismaClient {}

// 2. Registrar en Module
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

// 3. Inyectar donde se necesita
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  // NestJS inyecta automáticamente
}
```

### Scope de Providers
```typescript
@Injectable({ scope: Scope.DEFAULT })  // Singleton (default)
// Una instancia para toda la app

@Injectable({ scope: Scope.REQUEST })  // Por request
// Nueva instancia en cada HTTP request

@Injectable({ scope: Scope.TRANSIENT })  // Transient
// Nueva instancia cada vez que se inyecta
```

---

## 4. Promises y Async/Await

### ¿Qué es una Promise?

Una **Promise** representa un valor que **eventualmente** estará disponible.
```typescript
// Crear una Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Datos listos');
  }, 1000);
});

// Consumir con .then()
promise.then(data => console.log(data));

// Consumir con async/await
const data = await promise;
```

### Async/Await
```typescript
// ❌ Callback Hell
prisma.user.findUnique({ where: { id } }, (err, user) => {
  if (err) return handleError(err);
  prisma.transaction.findMany({ where: { userId: user.id } }, (err, transactions) => {
    if (err) return handleError(err);
    // ...
  });
});

// ✅ Async/Await (limpio)
const user = await prisma.user.findUnique({ where: { id } });
const transactions = await prisma.transaction.findMany({
  where: { userId: user.id }
});
```

### Promise.all
```typescript
// ❌ Secuencial (lento)
const user = await prisma.user.findUnique({ where: { id } });
const transactions = await prisma.transaction.findMany({ where: { userId: id } });
// Tarda: tiempo(user) + tiempo(transactions)

// ✅ Paralelo (rápido)
const [user, transactions] = await Promise.all([
  prisma.user.findUnique({ where: { id } }),
  prisma.transaction.findMany({ where: { userId: id } })
]);
// Tarda: max(tiempo(user), tiempo(transactions))
```

### Error Handling con Async/Await
```typescript
async function getUser(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

## 5. Error Handling

### Jerarquía de Errores en NestJS
```
Error (base)
  └─ HttpException
      ├─ BadRequestException (400)
      ├─ UnauthorizedException (401)
      ├─ ForbiddenException (403)
      ├─ NotFoundException (404)
      ├─ ConflictException (409)
      └─ InternalServerErrorException (500)
```

### Uso Correcto
```typescript
// ✅ Específico y claro
if (!user) {
  throw new NotFoundException('User not found');
}

if (user.id !== requestUserId) {
  throw new ForbiddenException('Access denied');
}

if (existingEmail) {
  throw new ConflictException('Email already exists');
}

// ❌ Genérico y confuso
throw new Error('Something went wrong');
throw new HttpException('Error', 500);
```

### Custom Exceptions
```typescript
export class InsufficientFundsException extends BadRequestException {
  constructor(balance: number, required: number) {
    super(`Insufficient funds. Balance: ${balance}, Required: ${required}`);
  }
}

// Uso
if (balance < amount) {
  throw new InsufficientFundsException(balance, amount);
}
```

### Exception Filters (Avanzado)
```typescript
@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // P2002 = Unique constraint violation
    if (exception.code === 'P2002') {
      return response.status(409).json({
        statusCode: 409,
        message: 'Resource already exists',
      });
    }

    return response.status(500).json({
      statusCode: 500,
      message: 'Database error',
    });
  }
}
```

---

## 6. Seguridad

### SQL Injection Prevention

**Vulnerable (SQL crudo):**
```typescript
// ❌ NUNCA hacer esto
const email = req.body.email;
const query = `SELECT * FROM users WHERE email = '${email}'`;
// Ataque: email = "' OR '1'='1"
// Query: SELECT * FROM users WHERE email = '' OR '1'='1'
// → Devuelve TODOS los usuarios
```

**Seguro (Prisma):**
```typescript
// ✅ Prisma previene SQL injection automáticamente
const user = await prisma.user.findUnique({
  where: { email: email }
});
// Prisma usa prepared statements
```

### XSS Prevention
```typescript
// ❌ Vulnerable
const comment = req.body.comment;
response.send(`<div>${comment}</div>`);
// Ataque: comment = "<script>alert('XSS')</script>"

// ✅ Seguro (NestJS escapa automáticamente)
return { comment: comment };
// JSON no ejecuta scripts
```

### CORS
```typescript
// main.ts
app.enableCors({
  origin: 'https://your-frontend.com',  // Solo este origen
  credentials: true,
});
```

### Rate Limiting
```typescript
// Prevenir brute force
@Throttle(5, 60)  // 5 requests en 60 segundos
@Post('login')
login() {}
```

### Helmet (Headers de Seguridad)
```typescript
import helmet from 'helmet';

app.use(helmet());
// Agrega headers de seguridad automáticamente
```

---

## 7. Performance

### Database Queries

**❌ N+1 Problem:**
```typescript
// Malo: 1 query para users + N queries para transactions
const users = await prisma.user.findMany();
for (const user of users) {
  user.transactions = await prisma.transaction.findMany({
    where: { userId: user.id }
  });
}
// Total: 1 + N queries
```

**✅ Con include:**
```typescript
// Bueno: 1 query con JOIN
const users = await prisma.user.findMany({
  include: {
    transactions: true
  }
});
// Total: 1 query
```

### Índices
```prisma
model Transaction {
  userId String
  date   DateTime

  // Sin índice: O(n) - escanea toda la tabla
  // Con índice: O(log n) - búsqueda binaria
  @@index([userId])
  @@index([date])
  @@index([userId, date])  // Índice compuesto
}
```

### Paginación
```typescript
// ❌ Sin paginación (trae todo)
const transactions = await prisma.transaction.findMany();
// Si hay 100,000 transacciones → 100,000 en memoria

// ✅ Con paginación
const page = 1;
const limit = 50;

const transactions = await prisma.transaction.findMany({
  skip: (page - 1) * limit,
  take: limit,
});
// Solo 50 en memoria
```

### Caching (Futuro)
```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getBalance(userId: string) {
    const cacheKey = `balance:${userId}`;

    // Buscar en cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // Calcular
    const balance = await this.calculateBalance(userId);

    // Guardar en cache (5 minutos)
    await this.cacheManager.set(cacheKey, balance, 300);

    return balance;
  }
}
```

### Conexión a DB
```typescript
// Prisma maneja connection pooling automáticamente
// Configuración en DATABASE_URL:
// ?connection_limit=10&pool_timeout=20
```

---

## 🎓 Patrones de Diseño

### Repository Pattern
```typescript
// Prisma actúa como repository
class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.transaction.findMany();
  }
}
```

### DTO Pattern
```typescript
// Separar representación de dominio vs API
class CreateTransactionDto {
  // Lo que recibimos de la API
  amount: number;
  type: string;
}

class Transaction {
  // Modelo de dominio
  id: string;
  amount: Decimal;
  type: TransactionType;
}
```

### Strategy Pattern
```typescript
// Diferentes estrategias de autenticación
interface AuthStrategy {
  validate(payload: any): Promise<User>;
}

class JwtStrategy implements AuthStrategy {
  async validate(payload: JwtPayload) {
    return this.prisma.user.findUnique({ where: { id: payload.sub } });
  }
}

class GoogleStrategy implements AuthStrategy {
  async validate(profile: GoogleProfile) {
    // Validar con Google OAuth
  }
}
```

---

## 🚀 Próximos Pasos

1. **[Best Practices →](./08-BEST-PRACTICES.md)**

---

<p align="center">
  <strong>La teoría detrás de la práctica 🧠</strong>
</p>
