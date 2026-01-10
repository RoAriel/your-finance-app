# 📖 API Reference

> Documentación completa de todos los endpoints

---

## 📋 Tabla de Contenidos

1. [Base URL](#base-url)
2. [Autenticación](#autenticación)
3. [Códigos de Estado](#códigos-de-estado)
4. [Auth Endpoints](#auth-endpoints)
5. [Transactions Endpoints](#transactions-endpoints)
6. [Errores Comunes](#errores-comunes)

---

## Base URL

```
http://localhost:3000
```

En producción sería algo como:
```
https://api.your-finance-app.com
```

---

## Autenticación

### Header Requerido

Para endpoints protegidos:

```http
Authorization: Bearer {jwt_token}
```

### Obtener Token

Hacer login o registro para obtener el token:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": { ... },
  "token": "eyJhbGc..."
}
```

---

## Códigos de Estado

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Request exitoso (GET, PATCH) |
| 201 | Created | Recurso creado (POST) |
| 400 | Bad Request | Validación falló |
| 401 | Unauthorized | Token inválido o faltante |
| 403 | Forbidden | No tiene permiso |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Recurso duplicado (ej: email) |
| 500 | Internal Server Error | Error del servidor |

---

## Auth Endpoints

### POST /auth/register

Crear nueva cuenta de usuario.

**Request:**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Validaciones:**
- `email`: Debe ser email válido
- `password`: Mínimo 8 caracteres
- `name`: Mínimo 2 caracteres

**Response 201:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error 409 (Email duplicado):**
```json
{
  "statusCode": 409,
  "message": "Email already registered",
  "error": "Conflict"
}
```

**Error 400 (Validación):**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

---

### POST /auth/login

Iniciar sesión.

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error 401 (Credenciales inválidas):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

### GET /auth/profile

Ver perfil del usuario autenticado.

**Request:**
```http
GET /auth/profile
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "This is your profile",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error 401 (Sin token):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## Transactions Endpoints

### POST /transactions

Crear nueva transacción.

**Request:**
```http
POST /transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "expense",
  "amount": 1500.50,
  "currency": "ARS",
  "description": "Compra en supermercado Día",
  "date": "2026-01-08",
  "categoryId": "uuid-categoria"
}
```

**Campos:**
- `type`: (requerido) `"income"` o `"expense"`
- `amount`: (requerido) Número > 0, máximo 2 decimales
- `currency`: (opcional) Código de moneda, default: `"ARS"`
- `description`: (opcional) Texto hasta 500 caracteres
- `date`: (opcional) Fecha ISO 8601, default: fecha actual
- `categoryId`: (opcional) UUID de categoría existente

**Response 201:**
```json
{
  "id": "trans-uuid-123",
  "userId": "user-uuid-456",
  "type": "expense",
  "amount": "1500.50",
  "currency": "ARS",
  "description": "Compra en supermercado Día",
  "date": "2026-01-08T00:00:00.000Z",
  "categoryId": "uuid-categoria",
  "createdAt": "2026-01-08T10:30:00.000Z",
  "updatedAt": "2026-01-08T10:30:00.000Z",
  "deletedAt": null,
  "category": {
    "id": "uuid-categoria",
    "name": "Supermercado",
    "type": "expense"
  }
}
```

**Error 400 (Validación):**
```json
{
  "statusCode": 400,
  "message": [
    "type must be either income or expense",
    "amount must be greater than 0"
  ],
  "error": "Bad Request"
}
```

---

### GET /transactions

Listar transacciones con filtros opcionales.

**Request:**
```http
GET /transactions?type=expense&startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer {token}
```

**Query Parameters:**
- `type`: (opcional) `"income"` o `"expense"`
- `startDate`: (opcional) Fecha inicio (ISO 8601)
- `endDate`: (opcional) Fecha fin (ISO 8601)
- `categoryId`: (opcional) UUID de categoría

**Response 200:**
```json
[
  {
    "id": "trans-uuid-1",
    "userId": "user-uuid",
    "type": "expense",
    "amount": "1500.50",
    "currency": "ARS",
    "description": "Compra en supermercado",
    "date": "2026-01-08T00:00:00.000Z",
    "category": {
      "id": "cat-uuid",
      "name": "Supermercado"
    },
    "createdAt": "2026-01-08T10:30:00.000Z",
    "updatedAt": "2026-01-08T10:30:00.000Z",
    "deletedAt": null
  },
  {
    "id": "trans-uuid-2",
    "type": "income",
    "amount": "50000.00",
    "currency": "ARS",
    "description": "Salario",
    "date": "2026-01-05T00:00:00.000Z",
    "category": null
  }
]
```

**Sin transacciones:**
```json
[]
```

---

### GET /transactions/balance

Ver balance total (ingresos, gastos, saldo).

**Request:**
```http
GET /transactions/balance
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "income": 115000,
  "expense": 1025.99,
  "balance": 113974.01,
  "totalTransactions": 6
}
```

---

### GET /transactions/:id

Ver detalle de una transacción específica.

**Request:**
```http
GET /transactions/trans-uuid-123
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "trans-uuid-123",
  "userId": "user-uuid",
  "type": "expense",
  "amount": "1500.50",
  "currency": "ARS",
  "description": "Compra en supermercado",
  "date": "2026-01-08T00:00:00.000Z",
  "categoryId": "cat-uuid",
  "category": {
    "id": "cat-uuid",
    "name": "Supermercado",
    "type": "expense"
  },
  "createdAt": "2026-01-08T10:30:00.000Z",
  "updatedAt": "2026-01-08T10:30:00.000Z",
  "deletedAt": null
}
```

**Error 404 (No existe):**
```json
{
  "statusCode": 404,
  "message": "Transaction with ID trans-uuid-123 not found",
  "error": "Not Found"
}
```

**Error 403 (No es tuya):**
```json
{
  "statusCode": 403,
  "message": "You do not have access to this transaction",
  "error": "Forbidden"
}
```

---

### PATCH /transactions/:id

Actualizar una transacción.

**Request:**
```http
PATCH /transactions/trans-uuid-123
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 2000,
  "description": "Actualizado: Compra en supermercado Día"
}
```

**Campos (todos opcionales):**
- `type`
- `amount`
- `currency`
- `description`
- `date`
- `categoryId`

**Response 200:**
```json
{
  "id": "trans-uuid-123",
  "userId": "user-uuid",
  "type": "expense",
  "amount": "2000.00",
  "currency": "ARS",
  "description": "Actualizado: Compra en supermercado Día",
  "date": "2026-01-08T00:00:00.000Z",
  "categoryId": "cat-uuid",
  "category": {
    "id": "cat-uuid",
    "name": "Supermercado"
  },
  "createdAt": "2026-01-08T10:30:00.000Z",
  "updatedAt": "2026-01-09T15:45:00.000Z",
  "deletedAt": null
}
```

---

### DELETE /transactions/:id

Eliminar una transacción (soft delete).

**Request:**
```http
DELETE /transactions/trans-uuid-123
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "trans-uuid-123",
  "userId": "user-uuid",
  "type": "expense",
  "amount": "1500.50",
  "currency": "ARS",
  "description": "Compra en supermercado",
  "date": "2026-01-08T00:00:00.000Z",
  "categoryId": "cat-uuid",
  "category": null,
  "createdAt": "2026-01-08T10:30:00.000Z",
  "updatedAt": "2026-01-09T16:00:00.000Z",
  "deletedAt": "2026-01-09T16:00:00.000Z"
}
```

**Nota:** La transacción NO se borra, se marca como eliminada (`deletedAt` != null).

---

## Errores Comunes

### 401 Unauthorized - Token Inválido

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causas:**
- No enviaste header `Authorization`
- Token expirado
- Token malformado
- JWT_SECRET cambió

**Solución:** Hacer login de nuevo para obtener nuevo token.

---

### 400 Bad Request - Validación

```json
{
  "statusCode": 400,
  "message": [
    "amount must be a number conforming to the specified constraints",
    "amount must be greater than 0"
  ],
  "error": "Bad Request"
}
```

**Causa:** Los datos enviados no cumplen las validaciones del DTO.

**Solución:** Revisar los campos y tipos de datos.

---

### 403 Forbidden - Sin Permiso

```json
{
  "statusCode": 403,
  "message": "You do not have access to this transaction",
  "error": "Forbidden"
}
```

**Causa:** Intentaste acceder a una transacción de otro usuario.

**Solución:** Solo podés acceder a tus propias transacciones.

---

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Transaction with ID xyz not found",
  "error": "Not Found"
}
```

**Causas:**
- El ID no existe
- La transacción fue eliminada (soft delete)
- La transacción es de otro usuario

---

### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "Email already registered",
  "error": "Conflict"
}
```

**Causa:** Ya existe un registro con esos datos únicos (ej: email).

---

## 🧪 Testing con cURL

### Registro
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login y guardar token
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq -r '.token')

echo "Token: $TOKEN"
```

### Crear transacción
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "expense",
    "amount": 500,
    "description": "Test transaction"
  }'
```

### Listar transacciones
```bash
curl http://localhost:3000/transactions \
  -H "Authorization: Bearer $TOKEN"
```

### Ver balance
```bash
curl http://localhost:3000/transactions/balance \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 Resumen de Endpoints

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | /auth/register | No | Crear cuenta |
| POST | /auth/login | No | Iniciar sesión |
| GET | /auth/profile | Sí | Ver perfil |
| POST | /transactions | Sí | Crear transacción |
| GET | /transactions | Sí | Listar transacciones |
| GET | /transactions/balance | Sí | Ver balance |
| GET | /transactions/:id | Sí | Ver transacción |
| PATCH | /transactions/:id | Sí | Actualizar transacción |
| DELETE | /transactions/:id | Sí | Eliminar transacción |

---

<p align="center">
  <strong>API Completa documentada 📖</strong>
</p>
