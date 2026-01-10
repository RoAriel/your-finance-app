# 💰 Módulo de Transacciones

> El corazón de la aplicación financiera

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Modelo de Datos](#modelo-de-datos)
3. [DTOs y Validación](#dtos-y-validación)
4. [Service - Lógica de Negocio](#service-lógica-de-negocio)
5. [Controller - Endpoints](#controller-endpoints)
6. [Filtros y Queries](#filtros-y-queries)
7. [Cálculo de Balance](#cálculo-de-balance)
8. [Soft Delete](#soft-delete)

---

## 1. Visión General

### ¿Qué es una Transaction?

Una **transacción** representa un movimiento de dinero:
- **Income (Ingreso):** Dinero que entra (salario, venta, etc.)
- **Expense (Gasto):** Dinero que sale (compra, pago, etc.)

### Campos de una Transaction
```typescript
{
  id: "uuid",
  userId: "quien-la-creó",
  type: "income" | "expense",
  amount: 1500.50,
  currency: "ARS",
  description: "Compra en supermercado",
  date: "2026-01-08",
  categoryId: "uuid-categoria" | null,
  createdAt: "timestamp",
  updatedAt: "timestamp",
  deletedAt: null
}
```

---

## 2. Modelo de Datos

### Prisma Schema
```prisma
model Transaction {
  // Identificación
  id          String    @id @default(uuid())
  userId      String    @map("user_id")

  // Datos financieros
  type        String    // 'income' | 'expense'
  amount      Decimal   @db.Decimal(15, 2)
  currency    String    @default("ARS")
  description String?   @db.Text
  date        DateTime  @default(now())
  categoryId  String?   @map("category_id")

  // Timestamps
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  // Relaciones
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  // Índices
  @@index([userId])
  @@index([date])
  @@index([categoryId])
  @@index([type])

  @@map("transactions")
}
```

### Decisiones de Diseño

**¿Por qué `Decimal` y no `Float`?**
```typescript
// ❌ Problema con Float
let total = 0.1 + 0.2;
console.log(total);  // 0.30000000000000004

// ✅ Decimal es preciso
amount: Decimal  // "0.30" exacto
```

**¿Por qué `type` es String y no Enum?**
```prisma
// Opción 1: String (elegimos esta)
type String  // Flexible, fácil de extender

// Opción 2: Enum
enum TransactionType {
  INCOME
  EXPENSE
}
type TransactionType
// Más estricto, requiere migración para agregar tipos
```

**¿Por qué `categoryId` es opcional?**
- Usuario puede crear transacción sin categoría
- Si se borra categoría, transacción no se pierde (`onDelete: SetNull`)

---

## 3. DTOs y Validación

### CreateTransactionDto
```typescript
import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, Min, MaxLength } from 'class-validator';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class CreateTransactionDto {
  @IsEnum(TransactionType, {
    message: 'Type must be either income or expense'
  })
  type: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string = 'ARS';

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;
}
```

### Validaciones Explicadas

**`@IsEnum(TransactionType)`**
```typescript
// ✅ Válido
type: "income"
type: "expense"

// ❌ Inválido
type: "other"    → "Type must be either income or expense"
type: "INCOME"   → Case-sensitive
```

**`@IsNumber({ maxDecimalPlaces: 2 })`**
```typescript
// ✅ Válido
amount: 100
amount: 100.50
amount: 100.5   // Se acepta

// ❌ Inválido
amount: 100.123  → "Amount must have at most 2 decimal places"
amount: "100"    → "Amount must be a number"
```

**`@Min(0.01)`**
```typescript
// ✅ Válido
amount: 0.01
amount: 1000

// ❌ Inválido
amount: 0        → "Amount must be greater than 0"
amount: -100     → "Amount must be greater than 0"
```

**`@IsDateString()`**
```typescript
// ✅ Válido
date: "2026-01-08"
date: "2026-01-08T10:30:00.000Z"

// ❌ Inválido
date: "08/01/2026"  → Formato incorrecto
date: "invalid"     → No es fecha
```

### UpdateTransactionDto
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
```

**¿Qué hace `PartialType`?**

Convierte todos los campos en opcionales:
```typescript
// CreateTransactionDto
{
  type: string;        // Requerido
  amount: number;      // Requerido
  description?: string; // Opcional
}

// UpdateTransactionDto (con PartialType)
{
  type?: string;        // Opcional
  amount?: number;      // Opcional
  description?: string; // Opcional
}
```

### QueryTransactionDto
```typescript
export class QueryTransactionDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
```

---

## 4. Service - Lógica de Negocio

### Crear Transacción
```typescript
async create(userId: string, dto: CreateTransactionDto) {
  return this.prisma.transaction.create({
    data: {
      userId,
      type: dto.type,
      amount: dto.amount,
      currency: dto.currency || 'ARS',
      description: dto.description,
      date: dto.date ? new Date(dto.date) : new Date(),
      categoryId: dto.categoryId,
    },
    include: {
      category: true,  // Incluir datos de la categoría
    },
  });
}
```

**Lógica implementada:**
1. Crear transacción para el usuario autenticado
2. Usar fecha actual si no se provee
3. Incluir categoría en la respuesta

### Listar Transacciones con Filtros
```typescript
async findAll(userId: string, query: QueryTransactionDto) {
  const where: {
    userId: string;
    deletedAt: null;
    type?: string;
    categoryId?: string;
    date?: { gte?: Date; lte?: Date; };
  } = {
    userId,
    deletedAt: null,
  };

  // Filtro por tipo
  if (query.type) {
    where.type = query.type;
  }

  // Filtro por categoría
  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  // Filtro por rango de fechas
  if (query.startDate || query.endDate) {
    where.date = {};
    if (query.startDate) {
      where.date.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      where.date.lte = new Date(query.endDate);
    }
  }

  return this.prisma.transaction.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      date: 'desc',
    },
  });
}
```

**Construcción dinámica de filtros:**
```typescript
// Sin filtros
where = { userId: "123", deletedAt: null }

// Con type=expense
where = { userId: "123", deletedAt: null, type: "expense" }

// Con fechas
where = {
  userId: "123",
  deletedAt: null,
  date: {
    gte: new Date("2026-01-01"),
    lte: new Date("2026-01-31")
  }
}
```

### Ver Una Transacción
```typescript
async findOne(userId: string, id: string) {
  const transaction = await this.prisma.transaction.findUnique({
    where: { id },
    include: {category: true,
},
});
if (!transaction) {
throw new NotFoundException(Transaction with ID ${id} not found);
}
// Verificar que pertenece al usuario
if (transaction.userId !== userId) {
throw new ForbiddenException('You do not have access to this transaction');
}
// Verificar que no esté eliminada
if (transaction.deletedAt) {
throw new NotFoundException(Transaction with ID ${id} not found);
}
return transaction;
}

**Seguridad implementada:**
1. ✅ Verificar que existe
2. ✅ Verificar que pertenece al usuario (no puede ver transacciones de otros)
3. ✅ Verificar que no esté eliminada

### Actualizar Transacción
```typescript
async update(userId: string, id: string, dto: UpdateTransactionDto) {
  // Verificar que existe y es del usuario
  await this.findOne(userId, id);

  const data: {
    type?: string;
    amount?: number;
    currency?: string;
    description?: string | null;
    date?: Date;
    categoryId?: string | null;
  } = {};

  // Solo actualizar campos enviados
  if (dto.type !== undefined) data.type = dto.type;
  if (dto.amount !== undefined) data.amount = dto.amount;
  if (dto.currency !== undefined) data.currency = dto.currency;
  if (dto.description !== undefined) data.description = dto.description;
  if (dto.date !== undefined) data.date = new Date(dto.date);
  if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;

  return this.prisma.transaction.update({
    where: { id },
    data,
    include: {
      category: true,
    },
  });
}
```

**Patrón de actualización parcial:**
```typescript
// Request
PATCH /transactions/123
{ amount: 1000 }

// Solo actualiza amount, deja el resto igual
```

### Eliminar (Soft Delete)
```typescript
async remove(userId: string, id: string) {
  // Verificar que existe y es del usuario
  await this.findOne(userId, id);

  // Soft delete: marcar como eliminado
  return this.prisma.transaction.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
```

---

## 5. Controller - Endpoints
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/interfaces/user-payload.interface';

@Controller('transactions')
@UseGuards(JwtAuthGuard)  // Todas las rutas protegidas
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @CurrentUser() user: UserPayload,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(user.id, createTransactionDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: UserPayload,
    @Query() query: QueryTransactionDto,
  ) {
    return this.transactionsService.findAll(user.id, query);
  }

  @Get('balance')
  getBalance(@CurrentUser() user: UserPayload) {
    return this.transactionsService.getBalance(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
```

### Rutas Resultantes
POST   /transactions           - Crear transacción
GET    /transactions           - Listar (con filtros)
GET    /transactions/balance   - Ver balance
GET    /transactions/:id       - Ver detalle
PATCH  /transactions/:id       - Actualizar
DELETE /transactions/:id       - Eliminar

**Importante:** `/transactions/balance` debe estar ANTES de `/transactions/:id` para que no se confunda `balance` con un ID.

---

## 6. Filtros y Queries

### Ejemplos de Uso

#### Listar todas las transacciones
```http
GET /transactions
Authorization: Bearer {token}
```

#### Filtrar solo gastos
```http
GET /transactions?type=expense
Authorization: Bearer {token}
```

#### Filtrar solo ingresos
```http
GET /transactions?type=income
Authorization: Bearer {token}
```

#### Filtrar por rango de fechas
```http
GET /transactions?startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer {token}
```

#### Filtrar por categoría
```http
GET /transactions?categoryId=uuid-categoria
Authorization: Bearer {token}
```

#### Combinación de filtros
```http
GET /transactions?type=expense&startDate=2026-01-01&categoryId=uuid
Authorization: Bearer {token}
```

### Lógica de Filtros
```typescript
// Sin filtros
SELECT * FROM transactions
WHERE user_id = 'user123' AND deleted_at IS NULL
ORDER BY date DESC;

// Con type=expense
SELECT * FROM transactions
WHERE user_id = 'user123'
  AND deleted_at IS NULL
  AND type = 'expense'
ORDER BY date DESC;

// Con fechas
SELECT * FROM transactions
WHERE user_id = 'user123'
  AND deleted_at IS NULL
  AND date >= '2026-01-01'
  AND date <= '2026-01-31'
ORDER BY date DESC;
```

---

## 7. Cálculo de Balance

### Método en Service
```typescript
async getBalance(userId: string) {
  // Obtener todas las transacciones activas
  const transactions = await this.prisma.transaction.findMany({
    where: {
      userId,
      deletedAt: null,
    },
  });

  // Calcular totales
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    income,
    expense,
    balance: income - expense,
    totalTransactions: transactions.length,
  };
}
```

### Respuesta
```json
{
  "income": 115000,
  "expense": 1025.99,
  "balance": 113974.01,
  "totalTransactions": 6
}
```

### Optimización Futura

**Actual:** Trae todas las transacciones a memoria y calcula.

**Optimizado (con Prisma aggregate):**
```typescript
async getBalance(userId: string) {
  const [income, expense, count] = await Promise.all([
    // Sumar ingresos
    this.prisma.transaction.aggregate({
      where: { userId, type: 'income', deletedAt: null },
      _sum: { amount: true },
    }),
    // Sumar gastos
    this.prisma.transaction.aggregate({
      where: { userId, type: 'expense', deletedAt: null },
      _sum: { amount: true },
    }),
    // Contar
    this.prisma.transaction.count({
      where: { userId, deletedAt: null },
    }),
  ]);

  const incomeTotal = Number(income._sum.amount || 0);
  const expenseTotal = Number(expense._sum.amount || 0);

  return {
    income: incomeTotal,
    expense: expenseTotal,
    balance: incomeTotal - expenseTotal,
    totalTransactions: count,
  };
}
```

**Ventaja:** Cálculo en la base de datos (más eficiente).

---

## 8. Soft Delete

### ¿Qué es Soft Delete?

En lugar de **eliminar** el registro, lo **marcamos como eliminado**.
```typescript
// Hard delete (elimina permanentemente)
await prisma.transaction.delete({ where: { id } });
// ❌ Registro desaparece de la DB

// Soft delete (marca como eliminado)
await prisma.transaction.update({
  where: { id },
  data: { deletedAt: new Date() }
});
// ✅ Registro sigue en DB pero con deletedAt != null
```

### Ventajas

1. **Historial completo:** No perdés datos
2. **Recuperable:** Podés "restaurar" (poner deletedAt = null)
3. **Auditoría:** Sabés qué se eliminó y cuándo
4. **Integridad:** Evitás problemas de foreign keys

### Implementación

**Schema:**
```prisma
model Transaction {
  deletedAt DateTime? @map("deleted_at")
}
```

**Eliminar:**
```typescript
async remove(userId: string, id: string) {
  return this.prisma.transaction.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}
```

**Excluir en queries:**
```typescript
await prisma.transaction.findMany({
  where: {
    userId,
    deletedAt: null  // ← Solo activos
  }
});
```

### Restaurar (futura feature)
```typescript
async restore(userId: string, id: string) {
  return this.prisma.transaction.update({
    where: { id },
    data: { deletedAt: null }
  });
}
```

---

## 🎯 Flujo Completo: Crear Transacción

Usuario autenticado hace:
POST /transactions
Authorization: Bearer eyJhbGc...
Body: { type: "expense", amount: 500, description: "Super" }
↓
JwtAuthGuard verifica token
→ Extrae userId del JWT
→ Pone user en request.user
↓
ValidationPipe valida CreateTransactionDto
→ type es 'income' o 'expense' ✅
→ amount > 0 ✅
→ Todos los campos válidos ✅
↓
TransactionsController recibe:

user.id (del @CurrentUser decorator)
dto validado (del @Body)

↓
Controller llama a Service:
transactionsService.create(user.id, dto)
↓
Service guarda en DB:
prisma.transaction.create({
data: {
userId: user.id,
type: dto.type,
amount: dto.amount,
...
}
})
↓
Prisma ejecuta SQL:
INSERT INTO transactions (id, user_id, type, amount, ...)
VALUES (uuid(), 'user123', 'expense', 500, ...)
RETURNING *;
↓
PostgreSQL devuelve el registro creado
↓
Response 201 Created:
{
"id": "trans-uuid",
"userId": "user123",
"type": "expense",
"amount": 500,
"description": "Super",
"date": "2026-01-08T...",
"category": null,
...
}


---

## 🔒 Seguridad Implementada

### 1. Autenticación
- ✅ Todas las rutas protegidas con JwtAuthGuard
- ✅ Solo usuarios autenticados pueden acceder

### 2. Autorización
- ✅ Usuario solo ve sus propias transacciones
- ✅ No puede acceder a transacciones de otros users
- ✅ Verificación en `findOne()` y `update()`

### 3. Validación
- ✅ DTOs validan todos los inputs
- ✅ Tipos correctos (number, string, enum)
- ✅ Rangos válidos (amount > 0)

### 4. Soft Delete
- ✅ Datos nunca se pierden
- ✅ Transacciones eliminadas no aparecen en listados
- ✅ Mantenemos historial completo

---

## 📊 Casos de Uso Reales

### Caso 1: Registrar Gasto en Supermercado
```http
POST /transactions
{
  "type": "expense",
  "amount": 1500.50,
  "currency": "ARS",
  "description": "Compra en Día"
}
```

### Caso 2: Registrar Salario
```http
POST /transactions
{
  "type": "income",
  "amount": 150000,
  "currency": "ARS",
  "description": "Salario enero 2026",
  "date": "2026-01-05"
}
```

### Caso 3: Ver Gastos del Mes
```http
GET /transactions?type=expense&startDate=2026-01-01&endDate=2026-01-31
```

### Caso 4: Ver Balance Actual
```http
GET /transactions/balance
```

### Caso 5: Corregir Monto de una Transacción
```http
PATCH /transactions/uuid-123
{
  "amount": 2000
}
```

---

## 🚀 Mejoras Futuras

### 1. Paginación
```typescript
class QueryTransactionDto {
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 50;
}

// En service
const skip = (page - 1) * limit;

await prisma.transaction.findMany({
  where,
  take: limit,
  skip: skip,
});
```

### 2. Ordenamiento Personalizado
```typescript
class QueryTransactionDto {
  @IsOptional()
  @IsEnum(['date', 'amount', 'createdAt'])
  sortBy?: string = 'date';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

### 3. Búsqueda por Descripción
```typescript
await prisma.transaction.findMany({
  where: {
    userId,
    description: {
      contains: searchTerm,
      mode: 'insensitive',
    },
  },
});
```

### 4. Transacciones Recurrentes
```prisma
model Transaction {
  isRecurring  Boolean  @default(false)
  frequency    String?  // 'daily', 'weekly', 'monthly'
  nextDate     DateTime?
}
```

### 5. Adjuntos/Recibos
```prisma
model Transaction {
  receiptUrl String?
}
```

---

## 🎓 Conceptos Clave

1. **Soft Delete:** Marcar como eliminado, no borrar
2. **Autorización:** Usuario solo accede a sus datos
3. **Filtros Dinámicos:** Construir where según query params
4. **Validación Multi-Capa:** DTO + Service + Database
5. **Partial Updates:** Solo actualizar campos enviados

---

## 🔗 Próximos Pasos

1. **[Ver API Reference completa →](./06-API-REFERENCE.md)**
2. **[Profundizar en Conceptos →](./07-CONCEPTS.md)**

---

<p align="center">
  <strong>Transactions = Core del sistema 💰</strong>
</p>
