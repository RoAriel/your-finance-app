# 🔐 Sistema de Autenticación

> Todo sobre cómo funciona el registro, login y JWT en el proyecto

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Flujo de Registro](#flujo-de-registro)
3. [Flujo de Login](#flujo-de-login)
4. [JWT (JSON Web Tokens)](#jwt-json-web-tokens)
5. [Guards y Protección](#guards-y-protección)
6. [Decorators Personalizados](#decorators-personalizados)
7. [Seguridad](#seguridad)
8. [Testing de Auth](#testing-de-auth)

---

## 1. Visión General

### ¿Qué es Autenticación?

**Autenticación:** Verificar que eres quien dices ser.

**Autorización:** Verificar que tenés permiso para hacer algo.

### Stack de Auth
```
┌─────────────────────────────────────┐
│     Authentication Stack            │
├─────────────────────────────────────┤
│                                     │
│  bcrypt                             │
│  └─→ Hash de passwords              │
│                                     │
│  JWT (jsonwebtoken)                 │
│  └─→ Generación de tokens           │
│                                     │
│  Passport.js                        │
│  └─→ Middleware de autenticación    │
│                                     │
│  @nestjs/passport                   │
│  └─→ Integración con NestJS         │
│                                     │
└─────────────────────────────────────┘
```

---

## 2. Flujo de Registro

### Paso a Paso
```
1. Usuario envía: { email, password, name }
   ↓
2. DTO valida formato
   ↓
3. AuthService verifica email no existe
   ↓
4. bcrypt hashea password
   ↓
5. User se guarda en DB
   ↓
6. JWT se genera con userId
   ↓
7. Response: { user, token }
```

### Código Detallado

#### 1. DTO - Validación de Input
```typescript
// register.dto.ts
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
```

**¿Qué valida?**
- ✅ Email válido (formato)
- ✅ Password mínimo 8 caracteres
- ✅ Name mínimo 2 caracteres
- ✅ Todos los campos son strings

#### 2. Controller - Endpoint HTTP
```typescript
// auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
```

**Responsabilidad:**
- Recibir HTTP POST /auth/register
- Validar DTO (automático con ValidationPipe)
- Llamar al service

#### 3. Service - Lógica de Negocio
```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Verificar email único
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // 2. Hashear password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // 3. Crear usuario
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    // 4. Generar token
    const token = this.generateToken(user.id, user.email);

    // 5. Retornar (sin password)
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
```

### Hash de Password con bcrypt
```typescript
const hashedPassword = await bcrypt.hash(dto.password, 12);
//                                                      ↑
//                                              salt rounds
```

**¿Qué es salt rounds?**
- Cuántas veces se aplica el algoritmo
- Más rounds = más seguro, pero más lento
- 12 rounds ≈ 300ms de procesamiento

**Ejemplo real:**
```typescript
Input:  "password123"
Output: "$2b$12$KIXxPz.kTZMHQqLx.vK0D.ABC..."
        ↑  ↑   ↑
        |  |   └─ Hash + salt
        |  └───── Salt rounds (12)
        └──────── Algoritmo (bcrypt 2b)
```

**¿Por qué no guardar password plano?**
```
❌ Hackean DB → Tienen todas las passwords
✅ Hackean DB → Tienen hashes (inútiles sin crackear)
```

---

## 3. Flujo de Login

### Paso a Paso
```
1. Usuario envía: { email, password }
   ↓
2. AuthService busca user por email
   ↓
3. Si no existe → 401 Unauthorized
   ↓
4. bcrypt.compare() verifica password
   ↓
5. Si no coincide → 401 Unauthorized
   ↓
6. JWT se genera
   ↓
7. Response: { user, token }
```

### Código Detallado
```typescript
async login(dto: LoginDto) {
  // 1. Buscar usuario
  const user = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // 2. Verificar password
  const isPasswordValid = await bcrypt.compare(
    dto.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // 3. Generar token
  const token = this.generateToken(user.id, user.email);

  // 4. Retornar
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
}
```

### ¿Por qué mismo error para email y password?
```typescript
// ❌ Malo (revela información)
if (!user) {
  throw new UnauthorizedException('User not found');
}
if (!isPasswordValid) {
  throw new UnauthorizedException('Wrong password');
}

// ✅ Bueno (no revela información)
if (!user || !isPasswordValid) {
  throw new UnauthorizedException('Invalid credentials');
}
```

**Razón:** Prevenir **enumeración de usuarios**.

**Ataque:**
```
POST /auth/login { email: "admin@empresa.com", password: "x" }
→ "User not found" → Email NO existe

POST /auth/login { email: "john@empresa.com", password: "x" }
→ "Wrong password" → Email SÍ existe ⚠️
```

---

## 4. JWT (JSON Web Tokens)

### ¿Qué es un JWT?

Un string en 3 partes separadas por `.`:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

│                                   │                                                  │
│         HEADER (base64)           │           PAYLOAD (base64)                      │    SIGNATURE
│   { alg: "HS256", typ: "JWT" }    │  { sub: "1234567890", name: "John Doe" }        │
```

### Estructura del JWT

#### Header
```json
{
  "alg": "HS256",    // Algoritmo de firma
  "typ": "JWT"       // Tipo de token
}
```

#### Payload (nuestro caso)
```json
{
  "sub": "user-uuid-123",           // Subject (userId)
  "email": "user@example.com",
  "iat": 1736188000,                // Issued at
  "exp": 1736792800                 // Expiration (7 días)
}
```

**Importante:** El payload NO está encriptado, solo codificado en base64.
```typescript
// Cualquiera puede decodificarlo
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload.email);  // "user@example.com"
```

**¿Entonces cómo es seguro?**

→ La **SIGNATURE** garantiza que no fue modificado.

#### Signature
```typescript
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET  // ← Solo el servidor conoce este secreto
)
```

**Si alguien modifica el payload:**
```
1. Cambia: "sub": "otro-usuario"
2. Recalcula signature → PERO no conoce JWT_SECRET
3. Servidor verifica signature → FALLA ❌
4. Token rechazado
```

### Generar JWT
```typescript
// En auth.service.ts
private generateToken(userId: string, email: string): string {
  const payload: JwtPayload = {
    sub: userId,    // Subject (standard JWT claim)
    email: email
  };

  return this.jwtService.sign(payload);
  // Usa JWT_SECRET del .env
  // Aplica expiración de JWT_EXPIRES_IN
}
```

### Verificar JWT
```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    // Passport ya verificó la firma
    // Acá validamos que el user existe
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Lo que retornemos acá va a request.user
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
```

### Flujo completo de un request autenticado
```
Cliente envía:
GET /transactions
Authorization: Bearer eyJhbGc...

    ↓

1. ExtractJwt extrae el token del header
    ↓

2. JwtStrategy verifica la firma con JWT_SECRET
    ↓

3. Si firma inválida → 401 Unauthorized
    ↓

4. Si firma válida → decodifica payload
    ↓

5. JwtStrategy.validate(payload) se ejecuta
    ↓

6. Busca user en DB por payload.sub
    ↓

7. Si no existe → 401 Unauthorized
    ↓

8. Si existe → retorna user data
    ↓

9. User data se pone en request.user
    ↓

10. Controller recibe request con user
```

---

## 5. Guards y Protección

### ¿Qué es un Guard?

Un **Guard** decide si un request puede continuar o no.
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Hereda de AuthGuard
  // 'jwt' se refiere a JwtStrategy
}
```

### Uso de Guards

#### Proteger un endpoint
```typescript
@Controller('transactions')
export class TransactionsController {

  @Get()
  @UseGuards(JwtAuthGuard)  // ← Protege esta ruta
  findAll() {
    // Solo accesible con token válido
  }
}
```

#### Proteger todo un controller
```typescript
@Controller('transactions')
@UseGuards(JwtAuthGuard)  // ← Protege todas las rutas
export class TransactionsController {

  @Get()      // Protegido
  findAll() {}

  @Post()     // Protegido
  create() {}
}
```

#### Rutas públicas en controller protegido
```typescript
@Controller('auth')
export class AuthController {

  @Post('register')  // Público
  register() {}

  @Post('login')     // Público
  login() {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)  // Solo esta protegida
  getProfile() {}
}
```

### Flujo del Guard
```typescript
Request → JwtAuthGuard → canActivate()
                              ↓
                        JwtStrategy
                              ↓
                     validate(payload)
                              ↓
                   ¿Usuario válido?
                    ↙            ↘
                 true           false
                   ↓              ↓
            Request OK      401 Error
```

---

## 6. Decorators Personalizados

### @CurrentUser Decorator

Nos permite obtener el usuario actual fácilmente.
```typescript
// current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;  // Puesto por JwtStrategy
  },
);
```

### Uso
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: UserPayload) {
  // user = { id, email, name }
  console.log(user.id);     // UUID del usuario
  console.log(user.email);  // Email del usuario

  return {
    message: `Hello ${user.name}!`,
    user,
  };
}
```

### Sin decorator (forma verbose)
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@Request() req) {
  const user = req.user;  // Mismo resultado, más código
  return { user };
}
```

---

## 7. Seguridad

### Hash de Passwords

#### ¿Por qué bcrypt?
```typescript
// ❌ NUNCA hacer esto
password: user.password  // Plano en DB

// ❌ NUNCA hacer esto
password: md5(user.password)  // MD5 es débil

// ✅ Correcto
password: await bcrypt.hash(user.password, 12)
```

**bcrypt ventajas:**
- **Slow by design:** Dificulta brute force
- **Salt incorporado:** Previene rainbow tables
- **Adaptive:** Podés aumentar rounds con el tiempo

#### Rainbow Tables

**Sin salt:**
```
Password: "123456"
MD5: "e10adc3949ba59abbe56e057f20f883e"

Atacante tiene tabla:
"123456" → "e10adc3949ba59abbe56e057f20f883e"
→ Descubre password instantáneamente
```

**Con bcrypt (salt):**
```
Password: "123456"
User 1: "$2b$12$ABC..."
User 2: "$2b$12$XYZ..."  ← Diferente hash!

Tabla inútil, cada hash es único
```

### JWT Secret
```env
# ❌ Débil
JWT_SECRET="secret"

# ✅ Fuerte
JWT_SECRET="a3d8f9e2b1c4567890abcdef1234567890abcdef1234567890abcdef123456"
```

**Generar secret seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Expiración de Tokens
```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '7d',  // Token expira en 7 días
  },
});
```

**Opciones:**
- `'60s'` - 60 segundos
- `'5m'` - 5 minutos
- `'1h'` - 1 hora
- `'7d'` - 7 días
- `'30d'` - 30 días

**Balance:**
- Corto (1h): Más seguro, peor UX (re-login frecuente)
- Largo (30d): Mejor UX, menos seguro

### Rate Limiting (futuro)

Para prevenir brute force:
```typescript
// Ejemplo con @nestjs/throttler
@Throttle(5, 60)  // 5 intentos por minuto
@Post('login')
login(@Body() dto: LoginDto) {
  // ...
}
```

---

## 8. Testing de Auth

### Con curl
```bash
# Registro
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Guardar token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq -r '.token')

# Usar token
curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Decodificar JWT en jwt.io

1. Ir a [jwt.io](https://jwt.io)
2. Pegar tu token
3. Ver payload decodificado

**Nunca pegues tokens de producción en sitios públicos.**

### Verificar en Postman

1. **Variables de entorno:**
```javascript
   // En Tests del login:
   pm.environment.set("token", pm.response.json().token);
```

2. **Usar en otros requests:**
```
   Authorization: Bearer {{token}}
```

---

## 🎓 Conceptos Clave

### Authentication vs Authorization

| Authentication | Authorization |
|---------------|---------------|
| ¿Quién eres? | ¿Qué puedes hacer? |
| Login con email/password | Verificar permisos |
| Genera token | Usa token |

### Stateless vs Stateful

| Stateless (JWT) | Stateful (Sessions) |
|-----------------|---------------------|
| ✅ Escalable (sin estado en servidor) | ❌ Requiere compartir sesiones |
| ✅ Funciona en mobile/web | ❌ Difícil en mobile |
| ❌ No se puede "revocar" fácil | ✅ Fácil revocar (borrar sesión) |
| ✅ No requiere Redis/DB | ❌ Requiere storage compartido |

---

## 🚀 Mejoras Futuras

1. **Refresh Tokens:** Token de larga duración para renovar access tokens
2. **Email Verification:** Verificar email al registrarse
3. **Password Reset:** Recuperación por email
4. **2FA:** Two-factor authentication
5. **OAuth:** Login con Google/GitHub
6. **Rate Limiting:** Prevenir brute force

---

## 🔗 Próximos Pasos

1. **[Explorar Transactions →](./05-TRANSACTIONS.md)**
2. **[Ver API Reference →](./06-API-REFERENCE.md)**

---

<p align="center">
  <strong>Security first 🔐</strong>
</p>
