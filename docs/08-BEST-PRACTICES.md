# ✨ Best Practices

> Mejores prácticas para código limpio y mantenible

---

## 📋 Tabla de Contenidos

1. [Estructura de Proyecto](#estructura-de-proyecto)
2. [Naming Conventions](#naming-conventions)
3. [TypeScript](#typescript)
4. [NestJS](#nestjs)
5. [Prisma](#prisma)
6. [Seguridad](#seguridad)
7. [Testing](#testing)
8. [Git](#git)
9. [Documentación](#documentación)

---

## 1. Estructura de Proyecto

### Organización por Features
```
✅ Bueno - Por feature
src/
├── auth/
│   ├── dto/
│   ├── guards/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── transactions/
│   ├── dto/
│   ├── transactions.controller.ts
│   ├── transactions.service.ts
│   └── transactions.module.ts

❌ Malo - Por tipo de archivo
src/
├── controllers/
│   ├── auth.controller.ts
│   └── transactions.controller.ts
├── services/
│   ├── auth.service.ts
│   └── transactions.service.ts
```

**Por qué:** Más fácil encontrar todo relacionado a una feature.

### Archivo por Clase/Interface
```
✅ Bueno
dto/
├── create-transaction.dto.ts
├── update-transaction.dto.ts
└── query-transaction.dto.ts

❌ Malo
dto/
└── transaction-dtos.ts  // Todas juntas
```

---

## 2. Naming Conventions

### Archivos
```typescript
// Kebab-case con sufijo descriptivo
auth.controller.ts
auth.service.ts
jwt-auth.guard.ts
current-user.decorator.ts
create-transaction.dto.ts
```

### Clases
```typescript
// PascalCase con sufijo
export class AuthController {}
export class AuthService {}
export class JwtAuthGuard {}
export class CreateTransactionDto {}
```

### Variables y Funciones
```typescript
// camelCase
const userId = '123';
const isValid = true;

function calculateBalance() {}
async function findTransaction() {}
```

### Constantes
```typescript
// UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_CURRENCY = 'ARS';
```

### Interfaces
```typescript
// PascalCase, sin prefijo "I"
interface UserPayload {
  id: string;
  email: string;
}

// ❌ Malo
interface IUserPayload {}
```

### Enums
```typescript
// PascalCase para enum, UPPER_CASE para valores
enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}
```

---

## 3. TypeScript

### Evitar `any`
```typescript
// ❌ Malo
function process(data: any) {
  return data.value;
}

// ✅ Bueno
function process(data: Transaction) {
  return data.amount;
}

// ✅ Si no conocés el tipo
function process(data: unknown) {
  if (isTransaction(data)) {
    return data.amount;
  }
}
```

### Usar tipos estrictos
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Interfaces sobre Types para objetos
```typescript
// ✅ Bueno - Interface
interface User {
  id: string;
  email: string;
}

// ✅ Bueno - Type para unions/intersections
type Status = 'active' | 'inactive';
type UserWithStatus = User & { status: Status };
```

### Evitar Type Assertions innecesarios
```typescript
// ❌ Malo
const user = data as User;

// ✅ Bueno
if (isUser(data)) {
  // TypeScript sabe que es User
  const user = data;
}
```

---

## 4. NestJS

### Un Controller = Una Responsabilidad
```typescript
// ✅ Bueno
@Controller('transactions')
export class TransactionsController {
  // Solo endpoints de transactions
}

// ❌ Malo
@Controller('api')
export class ApiController {
  // Mezcla transactions, users, etc.
}
```

### Services sin lógica HTTP
```typescript
// ❌ Malo - Service conoce HTTP
@Injectable()
export class AuthService {
  login(req: Request, res: Response) {
    // ...
    res.status(200).json({ token });
  }
}

// ✅ Bueno - Service puro
@Injectable()
export class AuthService {
  async login(dto: LoginDto): Promise<AuthResponse> {
    // ...
    return { user, token };
  }
}
```

### Inyección de Dependencias
```typescript
// ✅ Bueno - Constructor injection
@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}
}

// ❌ Malo - Property injection (evitar)
@Injectable()
export class TransactionsService {
  @Inject(PrismaService)
  private prisma: PrismaService;
}
```

### Guards específicos
```typescript
// ✅ Bueno - Guard por responsabilidad
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    // Verificar roles
  }
}

// Uso
@UseGuards(JwtAuthGuard, RolesGuard)
```

---

## 5. Prisma

### Nombrar modelos en singular
```prisma
// ✅ Bueno
model User {
  @@map("users")  // Tabla plural
}

// ❌ Malo
model Users {
  @@map("users")
}
```

### Timestamps siempre
```prisma
model Transaction {
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")  // Soft delete
}
```

### Índices en foreign keys y campos frecuentes
```prisma
model Transaction {
  userId String

  @@index([userId])      // FK
  @@index([date])        // Usado en ORDER BY
  @@index([type])        // Usado en WHERE
}
```

### Usar Decimal para dinero
```prisma
// ✅ Bueno
amount Decimal @db.Decimal(15, 2)

// ❌ Malo
amount Float
```

### onDelete explícito
```prisma
// ✅ Bueno - Decisión explícita
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

// ❌ Malo - Comportamiento por defecto puede sorprender
user User @relation(fields: [userId], references: [id])
```

---

## 6. Seguridad

### Nunca exponer passwords
```typescript
// ❌ Malo
return user;  // Incluye password

// ✅ Bueno
return {
  id: user.id,
  email: user.email,
  name: user.name,
  // password excluido
};

// ✅ Mejor - Con Prisma
return prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    password: false,  // Explícitamente excluido
  }
});
```

### Validar TODO input
```typescript
// ✅ Con DTOs
class CreateTransactionDto {
  @IsEnum(['income', 'expense'])
  type: string;

  @IsNumber()
  @Min(0.01)
  @Max(999999999.99)
  amount: number;
}
```

### Variables de entorno
```typescript
// ❌ Malo - Hard-coded
const secret = 'my-secret-123';

// ✅ Bueno
const secret = process.env.JWT_SECRET;

// ✅ Mejor - Validar que existe
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}
```

### Mensajes de error genéricos
```typescript
// ❌ Malo - Revela información
if (!user) throw new Error('User not found');
if (!isValidPassword) throw new Error('Wrong password');

// ✅ Bueno - Genérico
if (!user || !isValidPassword) {
  throw new UnauthorizedException('Invalid credentials');
}
```

---

## 7. Testing

### Estructura de Tests
```typescript
describe('TransactionsService', () => {
  describe('create', () => {
    it('should create a transaction', async () => {
      // Arrange
      const dto = { type: 'expense', amount: 500 };

      // Act
      const result = await service.create('user123', dto);

      // Assert
      expect(result.amount).toBe(500);
    });

    it('should throw if amount is negative', async () => {
      const dto = { type: 'expense', amount: -100 };

      await expect(
        service.create('user123', dto)
      ).rejects.toThrow();
    });
  });
});
```

### Mocks
```typescript
const mockPrisma = {
  transaction: {
    create: jest.fn(),
    findMany: jest.fn(),
  }
};

const module = await Test.createTestingModule({
  providers: [
    TransactionsService,
    {
      provide: PrismaService,
      useValue: mockPrisma,
    }
  ],
}).compile();
```

---

## 8. Git

### Commits Convencionales
```bash
# Formato
<type>(<scope>): <subject>

# Tipos
feat: Nueva funcionalidad
fix: Corrección de bug
docs: Documentación
chore: Tareas de mantenimiento
refactor: Refactoring sin cambio de funcionalidad
test: Tests
perf: Mejoras de performance

# Ejemplos
feat(auth): add JWT authentication
fix(transactions): correct balance calculation
docs: update API reference
chore: update dependencies
```

### Mensajes Descriptivos
```bash
# ❌ Malo
git commit -m "fix"
git commit -m "changes"
git commit -m "update"

# ✅ Bueno
git commit -m "fix(auth): prevent SQL injection in login"
git commit -m "feat(transactions): add date range filter"
git commit -m "docs: add setup guide for new developers"
```

### Commits Atómicos
```bash
# ❌ Malo - Todo junto
git add .
git commit -m "added auth and transactions and fixed bugs"

# ✅ Bueno - Por feature
git add src/auth/
git commit -m "feat(auth): implement JWT authentication"

git add src/transactions/
git commit -m "feat(transactions): implement CRUD endpoints"
```

### Branches
```bash
# Naming
main              # Producción
develop          # Desarrollo
feature/nombre   # Nueva funcionalidad
fix/nombre       # Corrección de bug
docs/nombre      # Documentación

Ejemplos
feature/transactions-module
fix/balance-calculation
docs/api-reference

### .gitignore Completo
```bash
# Dependencias
node_modules/
.pnpm-store/

# Build
dist/
build/
*.tsbuildinfo

# Env files
.env
.env.local
.env.*.local
!.env.example

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Prisma
apps/backend/prisma/migrations/**/migration_lock.toml

# Testing
coverage/
.nyc_output/
```

---

## 9. Documentación

### Comentarios útiles
```typescript
// ❌ Malo - Obvio
// Crear usuario
const user = await prisma.user.create({ data });

// ✅ Bueno - Explica el por qué
// Usamos transaction para garantizar atomicidad
// entre la creación del user y su profile
await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.profile.create({ data: profileData })
]);
```

### JSDoc para funciones públicas
```typescript
/**
 * Calcula el balance total del usuario
 * @param userId - ID del usuario
 * @returns Balance con ingresos, gastos y saldo
 * @throws {NotFoundException} Si el usuario no existe
 */
async getBalance(userId: string): Promise<BalanceResponse> {
  // ...
}
```

### README.md Actualizado
```markdown
# Your Finance App

## Quick Start
\`\`\`bash
pnpm install
pnpm dev:backend
\`\`\`

## Testing
\`\`\`bash
pnpm test
\`\`\`

## Documentation
See [docs/](./docs/)
```

### CHANGELOG.md
```markdown
# Changelog

## [Unreleased]
### Added
- Transactions module with CRUD operations
- Balance calculation endpoint

### Changed
- Updated Prisma to v6

### Fixed
- Balance calculation now excludes deleted transactions
```

---

## 🎯 Checklist de Calidad

Antes de hacer commit:

- [ ] Código compila sin errores
- [ ] Código pasa linting
- [ ] Tests pasan
- [ ] No hay `console.log` olvidados
- [ ] No hay código comentado
- [ ] Variables de entorno en `.env.example`
- [ ] `.env` no está commiteado
- [ ] Documentación actualizada si es necesario

---

## 🚀 Configurar ESLint

### Archivo de configuración
```javascript
// apps/backend/eslint.config.mjs
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Ajustar severidad
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/require-await': 'warn',

      // Reglas custom
      'no-console': 'warn',  // Avisar sobre console.log
      'no-debugger': 'error', // Error en debugger
    },
  },
  {
    ignores: ['dist', 'node_modules', '*.js', '*.mjs'],
  },
);
```

### Scripts útiles
```json
// package.json
{
  "scripts": {
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🔧 Configurar Prettier
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```
// .prettierignore
node_modules
dist
build
coverage
*.lock
pnpm-lock.yaml
---

## 📊 Performance Checklist

- [ ] Índices en columnas frecuentemente consultadas
- [ ] Usar `include` en lugar de queries separadas (evitar N+1)
- [ ] Paginación en listados grandes
- [ ] Evitar `SELECT *`, seleccionar solo campos necesarios
- [ ] Considerar cache para datos frecuentes
- [ ] Usar `Promise.all()` para operaciones paralelas

---

## 🔒 Security Checklist

- [ ] Passwords hasheadas con bcrypt (12+ rounds)
- [ ] JWT_SECRET aleatorio y largo (32+ chars)
- [ ] Validación de todos los inputs con DTOs
- [ ] Autorización en todos los endpoints
- [ ] CORS configurado correctamente
- [ ] Variables sensibles en .env (no commiteadas)
- [ ] Rate limiting en endpoints críticos (login)
- [ ] Helmet para headers de seguridad

---

## 📝 Code Review Checklist

### Para revisar tu propio código:

1. **Funcionalidad**
   - [ ] Hace lo que debe hacer
   - [ ] Maneja casos edge
   - [ ] Tiene validaciones apropiadas

2. **Calidad**
   - [ ] Nombres descriptivos
   - [ ] Sin código duplicado
   - [ ] Sin lógica compleja sin comentar
   - [ ] Sin código muerto

3. **Seguridad**
   - [ ] Valida inputs
   - [ ] No expone datos sensibles
   - [ ] Maneja errores apropiadamente

4. **Performance**
   - [ ] Sin queries N+1
   - [ ] Usa índices apropiados
   - [ ] No carga datos innecesarios

5. **Testing**
   - [ ] Casos principales cubiertos
   - [ ] Tests pasan
   - [ ] Mocks apropiados

---

## 🎓 Principios SOLID

### Single Responsibility
```typescript
// ✅ Una clase = una responsabilidad
class TransactionsService {
  // Solo lógica de transacciones
}

class EmailService {
  // Solo envío de emails
}
```

### Open/Closed
```typescript
// Abierto para extensión, cerrado para modificación
abstract class AuthStrategy {
  abstract validate(payload: any): Promise<User>;
}

class JwtStrategy extends AuthStrategy {}
class GoogleStrategy extends AuthStrategy {}
```

### Liskov Substitution
```typescript
// Las subclases deben ser sustituibles por sus clases base
class BaseService {
  async findAll(): Promise<any[]> {
    return [];
  }
}

class TransactionsService extends BaseService {
  async findAll(): Promise<Transaction[]> {
    // Cumple el contrato de BaseService
    return this.prisma.transaction.findMany();
  }
}
```

### Interface Segregation
```typescript
// Interfaces específicas, no gordas
interface Readable {
  read(): Promise<any>;
}

interface Writable {
  write(data: any): Promise<void>;
}

// Solo implementar lo que necesitas
class ReadOnlyService implements Readable {
  async read() { }
}
```

### Dependency Inversion
```typescript
// Depender de abstracciones, no de implementaciones
interface DatabaseService {
  findMany(): Promise<any[]>;
}

class TransactionsService {
  // Depende de la interfaz, no de Prisma directamente
  constructor(private db: DatabaseService) {}
}
```

---

## 🚀 CI/CD Básico (GitHub Actions)
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install pnpm
      run: npm install -g pnpm

    - name: Install dependencies
      run: pnpm install

    - name: Lint
      run: pnpm run lint

    - name: Type check
      run: pnpm run type-check

    - name: Run tests
      run: pnpm test
```

---

## 💡 Tips Finales

### 1. Lee Código de Otros
- Estudia repos de NestJS en GitHub
- Analiza ejemplos oficiales de Prisma
- Revisa código de bibliotecas que usas

### 2. Refactoriza Constantemente
```typescript
// Primera versión (funciona)
function calculate(a, b, c) {
  return a + b * c / 2;
}

// Refactorizada (clara)
function calculateAverageWeightedScore(
  baseScore: number,
  weight: number,
  multiplier: number
): number {
  return baseScore + (weight * multiplier) / 2;
}
```

### 3. Empieza Simple
```typescript
// ❌ No hacer over-engineering
class AdvancedTransactionFactoryManagerService {}

// ✅ Empezar simple
class TransactionsService {}
```

### 4. Documenta Decisiones
```typescript
// Por qué usamos Decimal en lugar de Float
// → Para evitar errores de precisión en cálculos monetarios
// → Ejemplo: 0.1 + 0.2 = 0.30000000000000004 (Float)
//           0.1 + 0.2 = 0.3 (Decimal)
amount: Decimal
```

### 5. Aprende de los Errores
```typescript
// Cuando algo falla, agrega un test
it('should not allow negative amounts', async () => {
  await expect(
    service.create({ amount: -100 })
  ).rejects.toThrow();
});
```

---

## 📚 Recursos Recomendados

### Libros
- **Clean Code** - Robert C. Martin
- **Refactoring** - Martin Fowler
- **Design Patterns** - Gang of Four

### Blogs
- [NestJS Blog](https://blog.nestjs.com/)
- [Prisma Blog](https://www.prisma.io/blog)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### Videos
- [NestJS Course](https://www.youtube.com/nestjs)
- [Prisma Tutorials](https://www.youtube.com/c/PrismaData)

---

## 🎯 Checklist de Proyecto Completo

- [ ] README.md completo y actualizado
- [ ] Documentación en /docs
- [ ] .env.example con todas las variables
- [ ] Tests con buena cobertura
- [ ] Linting configurado
- [ ] CI/CD básico
- [ ] Commits limpios y descriptivos
- [ ] Código sin warnings
- [ ] Performance optimizado
- [ ] Seguridad revisada

---

<p align="center">
  <strong>Código limpio = Mantenimiento fácil ✨</strong>
</p>
