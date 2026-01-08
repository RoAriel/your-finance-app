# Finance App - Roadmap

## ✅ Completado (Día 1-2)
- [x] Monorepo con pnpm workspaces
- [x] NestJS backend base
- [x] Prisma + Supabase connection
- [x] User model y migración
- [x] Auth module completo (register, login, JWT)
- [x] Guards y decorators para rutas protegidas

## 🚧 En progreso (Día 3)
- [ ] Transactions module
  - [ ] Schema de Prisma (Transaction model)
  - [ ] DTOs (CreateTransactionDto, UpdateTransactionDto)
  - [ ] Endpoints CRUD completos
  - [ ] Filtros por fecha y categoría
  - [ ] Paginación

## 📅 Próximos pasos
- [ ] Categories module (CRUD de categorías custom)
- [ ] Savings module (cuentas de ahorro multi-moneda)
- [ ] Credit Cards module (tarjetas + cuotas)
- [ ] Reports module (reportes mensuales/anuales)
- [ ] Export to Excel
- [ ] Frontend (React + Next.js)

## 🎯 Objetivos Día 3 (Mañana)

### 1. Modelo de Transactions en Prisma
```prisma
model Transaction {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  type        String   // 'income' | 'expense'
  amount      Decimal  @db.Decimal(15, 2)
  currency    String   @default("ARS")
  description String?
  date        DateTime @default(now())
  categoryId  String?  @map("category_id")
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@map("transactions")
}
```

### 2. Endpoints a implementar
- POST /transactions (crear)
- GET /transactions (listar con filtros)
- GET /transactions/:id (ver detalle)
- PATCH /transactions/:id (editar)
- DELETE /transactions/:id (soft delete)

### 3. Validaciones
- amount > 0
- type debe ser 'income' o 'expense'
- currency válida (ARS, USD, EUR)
- description opcional (max 500 chars)