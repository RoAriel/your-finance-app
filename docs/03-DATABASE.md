# 🗄️ Base de Datos y Prisma

> Todo sobre los modelos, relaciones y cómo funciona Prisma

---

## 📋 Tabla de Contenidos

1. [Introducción a Prisma](#introducción-a-prisma)
2. [Schema de Prisma](#schema-de-prisma)
3. [Modelos Explicados](#modelos-explicados)
4. [Relaciones](#relaciones)
5. [Migraciones](#migraciones)
6. [Queries con Prisma](#queries-con-prisma)
7. [Índices y Performance](#índices-y-performance)
8. [Buenas Prácticas](#buenas-prácticas)

---

## 1. Introducción a Prisma

### ¿Qué es Prisma?

**Prisma** es un ORM (Object-Relational Mapping) de próxima generación para TypeScript y Node.js.

### Componentes de Prisma
```
┌─────────────────────────────────────┐
│       Prisma Ecosystem              │
├─────────────────────────────────────┤
│                                     │
│  1. Prisma Schema                   │
│     - Define tus modelos            │
│     - schema.prisma                 │
│                                     │
│  2. Prisma Client                   │
│     - Auto-generado                 │
│     - Type-safe queries             │
│                                     │
│  3. Prisma Migrate                  │
│     - Gestiona cambios en DB        │
│     - Versionado de schema          │
│                                     │
│  4. Prisma Studio                   │
│     - GUI para ver/editar datos     │
│     - npx prisma studio             │
│                                     │
└─────────────────────────────────────┘
```

### Ventajas sobre SQL puro

**SQL puro:**
```sql
SELECT t.*, c.name as category_name
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = $1 AND t.deleted_at IS NULL
ORDER BY t.date DESC;
```

**Con Prisma:**
```typescript
await prisma.transaction.findMany({
  where: {
    userId: userId,
    deletedAt: null
  },
  include: {
    category: true
  },
  orderBy: {
    date: 'desc'
  }
});
```

**Ventajas:**
- ✅ Type-safe (TypeScript sabe qué campos existen)
- ✅ Auto-completion en el IDE
- ✅ Menos propenso a errores
- ✅ Fácil de refactorizar

---

## 2. Schema de Prisma

### Ubicación
```
apps/backend/prisma/schema.prisma
```

### Estructura del Schema
```prisma
// 1. Generator - Qué generar
generator client {
  provider = "prisma-client-js"
}

// 2. Datasource - Dónde conectar
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// 3. Models - Tus tablas
model User {
  id    String @id @default(uuid())
  email String @unique
  // ...
}
```

---

## 3. Modelos Explicados

### Modelo User
```prisma
model User {
  // Campos
  id        String    @id @default(uuid())
  email     String    @unique
  password  String
  name      String?

  // Timestamps
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // Relaciones
  transactions Transaction[]
  categories   Category[]

  // Configuración
  @@map("users")
}
```

#### Explicación campo por campo:

**`id String @id @default(uuid())`**
- `String`: Tipo de dato (texto)
- `@id`: Clave primaria
- `@default(uuid())`: Genera UUID automáticamente
- Ejemplo: `"550e8400-e29b-41d4-a716-446655440000"`

**`email String @unique`**
- `@unique`: No puede haber dos users con el mismo email
- PostgreSQL crea un índice automático

**`password String`**
- Sin `@unique`: Puede repetirse (aunque improbable con bcrypt)
- Almacena el hash, no la contraseña real

**`name String?`**
- `?`: Campo opcional (nullable)
- Puede ser `null` en la base de datos

**`createdAt DateTime @default(now())`**
- `@default(now())`: Se setea automáticamente al crear
- `@map("created_at")`: En DB se llama `created_at` (snake_case)

**`updatedAt DateTime @updatedAt`**
- `@updatedAt`: Prisma lo actualiza automáticamente en cada update

**`deletedAt DateTime?`**
- Opcional: `null` = activo, `NOT NULL` = eliminado
- Patrón "soft delete"

**`transactions Transaction[]`**
- Relación uno-a-muchos
- Un user tiene muchas transactions
- `[]` indica array

**`@@map("users")`**
- Nombre de la tabla en PostgreSQL
- Model en singular, tabla en plural

---

### Modelo Transaction
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

#### Campos especiales:

**`amount Decimal @db.Decimal(15, 2)`**
- `Decimal`: Tipo preciso para dinero
- `15, 2`: 15 dígitos totales, 2 decimales
- Ejemplo: `999999999999.99`
- **Por qué no Float:** `0.1 + 0.2 !== 0.3` en JavaScript

**`type String`**
- Guardamos como string, validamos en DTO
- Alternativa: usar `enum` en Prisma
```prisma
enum TransactionType {
  INCOME
  EXPENSE
}
```

**`currency String @default("ARS")`**
- Valor por defecto: Pesos argentinos
- Soporta: ARS, USD, EUR, etc.

**`description String? @db.Text`**
- `@db.Text`: En PostgreSQL es tipo TEXT (sin límite)
- Por defecto sería VARCHAR(255)

**`onDelete: Cascade`**
- Si se elimina el user, se eliminan sus transactions
- **Cascade**: eliminar en cascada
- **SetNull**: poner en null
- **Restrict**: no permitir eliminar

**`@@index([userId])`**
- Crea índice en la columna `user_id`
- Acelera queries del tipo: `WHERE user_id = ?`

---

### Modelo Category
```prisma
model Category {
  // Identificación
  id     String  @id @default(uuid())
  userId String  @map("user_id")

  // Datos
  name   String
  type   String  // 'income' | 'expense' | 'both'
  color  String? // Hex color: "#FF5733"
  icon   String? // Nombre del ícono

  // Timestamps
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // Relaciones
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  // Constraints
  @@unique([userId, name, type])
  @@index([userId])

  @@map("categories")
}
```

#### Campos especiales:

**`@@unique([userId, name, type])`**
- **Constraint compuesto**: La combinación debe ser única
- User "123" puede tener categoría "Comida" de tipo "expense"
- User "123" puede tener categoría "Comida" de tipo "income"
- User "123" NO puede tener dos "Comida" expense

---

## 4. Relaciones

### Tipos de Relaciones

#### One-to-Many (Uno a Muchos)
```prisma
// Un usuario tiene muchas transacciones
model User {
  id           String        @id
  transactions Transaction[] // Lado "muchos"
}

model Transaction {
  id     String @id
  userId String
  user   User   @relation(fields: [userId], references: [id]) // Lado "uno"
}
```

**En la práctica:**
```typescript
// Obtener usuario con sus transacciones
const user = await prisma.user.findUnique({
  where: { id: 'user123' },
  include: {
    transactions: true  // Trae todas sus transactions
  }
});
// user.transactions = [...]
```

#### One-to-One (Uno a Uno)
```prisma
// Ejemplo hipotético: User profile
model User {
  id      String   @id
  profile Profile?
}

model Profile {
  id     String @id
  userId String @unique  // ← @unique hace que sea 1-to-1
  user   User   @relation(fields: [userId], references: [id])
}
```

#### Many-to-Many (Muchos a Muchos)
```prisma
// Ejemplo hipotético: Posts y Tags
model Post {
  id   String @id
  tags Tag[]  @relation("PostToTag")
}

model Tag {
  id    String @id
  posts Post[] @relation("PostToTag")
}

// Prisma crea automáticamente tabla intermedia: _PostToTag
```

---

## 5. Migraciones

### ¿Qué son las migraciones?
Migraciones son cambios versionados en el schema de la base de datos.
Flujo de Migraciones
1. Modificas schema.prisma
   ↓
2. Ejecutas: npx prisma migrate dev --name descripcion
   ↓
3. Prisma:
   - Compara schema actual vs DB
   - Genera SQL con los cambios
   - Ejecuta SQL en la DB
   - Guarda migración en prisma/migrations/
   ↓
4. Código SQL guardado en:
   migrations/20260109_descripcion/migration.sql
Comandos de Migraciones
bash# Crear y aplicar migración en desarrollo
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones pendientes en producción
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status

# Resetear DB (⚠️ BORRA TODO)
npx prisma migrate reset

# Generar SQL sin aplicar
npx prisma migrate dev --create-only
Ejemplo de Migración
Schema antes:
prismamodel User {
  id    String @id
  email String
}
Schema después:
prismamodel User {
  id    String @id
  email String @unique  // ← Agregamos unique
  name  String?        // ← Agregamos campo
}
SQL generado (migration.sql):
sql-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AlterTable
ALTER TABLE "User" ADD COLUMN "name" TEXT;

6. Queries con Prisma
Operaciones CRUD
Create (Crear)
typescript// Crear un registro
const transaction = await prisma.transaction.create({
  data: {
    userId: 'user123',
    type: 'expense',
    amount: 500,
    description: 'Supermercado'
  }
});

// Crear con relación
const transaction = await prisma.transaction.create({
  data: {
    type: 'expense',
    amount: 500,
    user: {
      connect: { id: 'user123' }  // Conectar con user existente
    }
  }
});
Read (Leer)
typescript// Buscar uno por ID
const transaction = await prisma.transaction.findUnique({
  where: { id: 'trans123' }
});

// Buscar uno con condiciones
const transaction = await prisma.transaction.findFirst({
  where: {
    userId: 'user123',
    type: 'expense'
  }
});

// Buscar muchos
const transactions = await prisma.transaction.findMany({
  where: {
    userId: 'user123',
    deletedAt: null
  },
  orderBy: {
    date: 'desc'
  },
  take: 10,  // Límite
  skip: 0    // Offset (paginación)
});

// Buscar con relaciones
const transaction = await prisma.transaction.findUnique({
  where: { id: 'trans123' },
  include: {
    user: true,      // Incluir datos del user
    category: true   // Incluir datos de la category
  }
});
Update (Actualizar)
typescript// Actualizar uno
const updated = await prisma.transaction.update({
  where: { id: 'trans123' },
  data: {
    amount: 600,
    description: 'Actualizado'
  }
});

// Actualizar muchos
const count = await prisma.transaction.updateMany({
  where: {
    userId: 'user123',
    type: 'expense'
  },
  data: {
    currency: 'USD'
  }
});
Delete (Eliminar)
typescript// Eliminar uno
const deleted = await prisma.transaction.delete({
  where: { id: 'trans123' }
});

// Eliminar muchos
const count = await prisma.transaction.deleteMany({
  where: {
    userId: 'user123'
  }
});

// Soft delete (actualizar deletedAt)
const softDeleted = await prisma.transaction.update({
  where: { id: 'trans123' },
  data: {
    deletedAt: new Date()
  }
});
Filtros Avanzados
typescript// Operadores de comparación
await prisma.transaction.findMany({
  where: {
    amount: {
      gte: 100,  // Mayor o igual
      lte: 1000  // Menor o igual
    }
  }
});

// Búsqueda de texto
await prisma.transaction.findMany({
  where: {
    description: {
      contains: 'super',     // Contiene
      mode: 'insensitive'    // Case-insensitive
    }
  }
});

// Fechas
await prisma.transaction.findMany({
  where: {
    date: {
      gte: new Date('2026-01-01'),
      lt: new Date('2026-02-01')
    }
  }
});

// Operadores lógicos
await prisma.transaction.findMany({
  where: {
    OR: [
      { type: 'income' },
      { amount: { gte: 1000 } }
    ],
    AND: [
      { userId: 'user123' },
      { deletedAt: null }
    ]
  }
});
Agregaciones
typescript// Contar
const count = await prisma.transaction.count({
  where: { userId: 'user123' }
});

// Agregar funciones (sum, avg, min, max)
const result = await prisma.transaction.aggregate({
  where: { userId: 'user123', type: 'expense' },
  _sum: {
    amount: true
  },
  _avg: {
    amount: true
  },
  _count: true
});
// result._sum.amount = total gastado
// result._avg.amount = promedio
// result._count = cantidad
```

---

## 7. Índices y Performance

### ¿Por qué necesitamos índices?

**Sin índice:**
```
SELECT * FROM transactions WHERE user_id = 'user123';
→ PostgreSQL escanea TODAS las filas (Slow 🐌)
```

**Con índice:**
```
@@index([userId])
→ PostgreSQL usa el índice (Fast ⚡)
Tipos de Índices en nuestro Schema
prismamodel Transaction {
  // ...

  // Índice simple
  @@index([userId])        // Queries por usuario
  @@index([date])          // Queries por fecha
  @@index([type])          // Queries por tipo

  // Índice único
  @@unique([userId, name]) // No duplicados

  // Índice compuesto
  @@index([userId, date])  // Queries por usuario Y fecha
}
Cuándo agregar índices
✅ Agregar índice si:

Hacés queries frecuentes en ese campo
Es foreign key
Usas el campo en WHERE, ORDER BY, JOIN

❌ NO agregar índice si:

La tabla es muy pequeña (<1000 filas)
Raramente consultás ese campo
Hacés muchos INSERT/UPDATE (índices los hacen más lentos)

Costo de los Índices
Ventajas:

🚀 Queries más rápidos

Desventajas:

💾 Ocupan espacio en disco
🐌 INSERT/UPDATE más lentos (tiene que actualizar índices)


8. Buenas Prácticas
Naming Conventions
prisma// ✅ Bueno
model User {          // Singular, PascalCase
  id String @id
  @@map("users")      // Plural, snake_case en DB
}

// ❌ Malo
model users {         // Debería ser singular
  ID string @id       // Debería ser camelCase
}
Siempre incluir timestamps
prismamodel MiModelo {
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")  // Soft delete
}
Usar UUIDs para IDs
prisma// ✅ UUID (recomendado)
id String @id @default(uuid())

// ❌ Auto-increment (problemas en distributed systems)
id Int @id @default(autoincrement())
Manejar relaciones con cuidado
prisma// ✅ Bueno: Especificar onDelete
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

// ❌ Malo: Sin onDelete (puede causar errores)
user User @relation(fields: [userId], references: [id])
Usar Decimal para dinero
prisma// ✅ Bueno
amount Decimal @db.Decimal(15, 2)

// ❌ Malo (impreciso)
amount Float
```

### Validar en múltiples capas
```
1. DTO (class-validator)     ← Validación de formato
2. Service                    ← Validación de negocio
3. Database (Constraints)     ← Última línea de defensa

🛠️ Herramientas Útiles
Prisma Studio
bashnpx prisma studio
Abre una GUI en http://localhost:5555 para ver/editar datos.
Formatear Schema
bashnpx prisma format
Ver SQL generado
bash# Ver queries en la consola
// En código:
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

🎓 Para Profundizar
Documentación oficial:

Prisma Docs
Prisma Schema Reference

Tutoriales:

Prisma with NestJS


🚀 Próximos Pasos

Entender Autenticación →
Explorar Transactions →


<p align="center">
  <strong>Prisma = Type-safety + Developer Experience 🎯</strong>
</p>
