# 📚 Introducción - Your Finance App

> Una guía completa para entender este proyecto desde cero

---

## 🎯 ¿Qué es este proyecto?

**Your Finance App** es una aplicación de finanzas personales construida con tecnologías modernas de desarrollo web. Permite a los usuarios:

- Registrar ingresos y gastos
- Categorizar sus transacciones
- Ver su balance en tiempo real
- Gestionar múltiples monedas
- Mantener un historial completo

Pero más importante: **es un proyecto educativo** diseñado para enseñar desarrollo backend profesional.

---

## 🤔 ¿Para quién es este proyecto?

### ✅ Ideal para ti si:

- Estás aprendiendo desarrollo web
- Conocés JavaScript/TypeScript básico
- Querés entender cómo funciona un backend moderno
- Buscás ejemplos de código bien estructurado
- Te interesa aprender buenas prácticas

### 📚 No necesitás saber:

- NestJS (lo aprenderás aquí)
- Prisma (está explicado paso a paso)
- PostgreSQL avanzado (empezamos desde lo básico)
- Patrones de diseño (los descubrirás en el código)

---

## 💡 ¿Qué aprenderás?

### 1. **Backend con NestJS**

NestJS es un framework de Node.js que te enseña a escribir código **organizado, escalable y mantenible**.

**Conceptos que dominarás:**
- Módulos y arquitectura modular
- Inyección de dependencias
- Controllers, Services y Providers
- Guards y Middleware
- Decorators personalizados

### 2. **Base de Datos con Prisma**

Prisma es un ORM (Object-Relational Mapping) moderno que hace que trabajar con bases de datos sea más fácil y seguro.

**Lo que aprenderás:**
- Diseñar modelos de datos
- Crear relaciones entre tablas
- Ejecutar migraciones
- Queries con type-safety
- Optimización con índices

### 3. **Autenticación y Seguridad**

La seguridad es crítica en aplicaciones financieras.

**Implementarás:**
- Registro y login de usuarios
- Hash de passwords con bcrypt
- Tokens JWT (JSON Web Tokens)
- Protección de rutas
- Autorización por usuario

### 4. **API REST profesional**

Construirás una API siguiendo estándares de la industria.

**Incluye:**
- Endpoints RESTful bien diseñados
- Validación de datos con DTOs
- Códigos de estado HTTP correctos
- Manejo de errores consistente
- Filtros y paginación

### 5. **TypeScript Avanzado**

TypeScript te ayuda a escribir código más confiable.

**Verás en acción:**
- Tipos e interfaces
- Generics
- Decorators
- Type inference
- Strict mode

---

## 🏗️ Arquitectura General

### Frontend (futuro)
```
┌─────────────────┐
│  React App      │
│  (Next.js)      │
└────────┬────────┘
         │ HTTP Requests
         │ (con JWT token)
         ↓
```

### Backend (lo que construimos)
```
┌─────────────────────────────────────┐
│         NestJS Application          │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐      ┌─────────────┐ │
│  │   Auth   │      │Transactions │ │
│  │  Module  │      │   Module    │ │
│  └────┬─────┘      └──────┬──────┘ │
│       │                   │        │
│       └───────┬───────────┘        │
│               ↓                    │
│        ┌─────────────┐             │
│        │   Prisma    │             │
│        │   Module    │             │
│        └──────┬──────┘             │
└───────────────┼────────────────────┘
                │
                ↓
        ┌───────────────┐
        │  PostgreSQL   │
        │  (Supabase)   │
        └───────────────┘
```

---

## 🔑 Conceptos Clave Explicados

### ¿Qué es una API REST?

**API** = Application Programming Interface (Interfaz de Programación de Aplicaciones)

**REST** = Representational State Transfer (un estilo de arquitectura)

**En simple:** Es una forma estandarizada de comunicar aplicaciones a través de HTTP.

**Ejemplo:**
```
Cliente: "Hola servidor, dame todas mis transacciones"
GET /transactions

Servidor: "Aquí están tus transacciones"
200 OK [{ id: 1, amount: 500 }, { id: 2, amount: 1000 }]
```

### ¿Qué es un ORM?

**ORM** = Object-Relational Mapping

**En simple:** Te permite trabajar con la base de datos usando objetos de JavaScript en lugar de escribir SQL.

**Sin ORM (SQL puro):**
```sql
SELECT * FROM transactions WHERE user_id = '123' AND deleted_at IS NULL;
```

**Con ORM (Prisma):**
```typescript
await prisma.transaction.findMany({
  where: { 
    userId: '123',
    deletedAt: null 
  }
});
```

### ¿Qué es JWT?

**JWT** = JSON Web Token

**En simple:** Un "ticket" cifrado que demuestra que un usuario está autenticado.

**Flujo:**
1. Usuario hace login → Servidor valida credenciales
2. Servidor genera JWT con info del usuario
3. Usuario guarda el JWT
4. En cada request, usuario envía el JWT
5. Servidor verifica el JWT y autoriza el request

**Ventaja:** El servidor no necesita guardar sesiones en memoria.

### ¿Qué es un DTO?

**DTO** = Data Transfer Object

**En simple:** Una clase que define qué datos esperamos recibir y cómo validarlos.

**Ejemplo:**
```typescript
class CreateTransactionDto {
  @IsNumber()
  @Min(0.01)
  amount: number;  // Debe ser número y mayor a 0

  @IsEnum(['income', 'expense'])
  type: string;  // Solo puede ser 'income' o 'expense'
}
```

### ¿Qué es Dependency Injection?

**En simple:** NestJS "inyecta" automáticamente las dependencias que necesita un servicio.

**Sin DI:**
```typescript
class TransactionsService {
  private prisma = new PrismaService();  // Acoplado
}
```

**Con DI:**
```typescript
class TransactionsService {
  constructor(private prisma: PrismaService) {}  // Inyectado
}
// NestJS se encarga de crear PrismaService y pasarlo
```

**Ventaja:** Fácil de testear, reutilizar y mantener.

---

## 🛤️ Ruta de Aprendizaje Recomendada

### Nivel 1: Familiarización (Días 1-2)
1. Leer toda esta introducción
2. Seguir el [Setup Guide](./01-SETUP-GUIDE.md) paso a paso
3. Correr la aplicación localmente
4. Probar los endpoints con Postman/curl

### Nivel 2: Comprensión (Días 3-5)
1. Estudiar la [Arquitectura](./02-ARCHITECTURE.md)
2. Entender el [esquema de base de datos](./03-DATABASE.md)
3. Analizar el módulo de [Autenticación](./04-AUTHENTICATION.md)
4. Explorar el módulo de [Transacciones](./05-TRANSACTIONS.md)

### Nivel 3: Profundización (Días 6-10)
1. Leer [Conceptos Técnicos](./07-CONCEPTS.md) en detalle
2. Estudiar [Best Practices](./08-BEST-PRACTICES.md)
3. Modificar el código y experimentar
4. Agregar nuevas features (ej: categorías)

### Nivel 4: Maestría (Semanas 2-4)
1. Construir un módulo nuevo desde cero
2. Implementar tests unitarios
3. Agregar documentación con Swagger
4. Deploy en producción

---

## 🎓 Recursos Complementarios

### Para aprender más sobre cada tecnología:

**NestJS:**
- [Documentación oficial](https://docs.nestjs.com/)
- [NestJS Fundamentals (curso oficial)](https://courses.nestjs.com/)

**TypeScript:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive (libro gratis)](https://basarat.gitbook.io/typescript/)

**Prisma:**
- [Documentación oficial](https://www.prisma.io/docs)
- [Prisma Data Guide](https://www.prisma.io/dataguide)

**PostgreSQL:**
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [SQL interactivo](https://www.sqlteaching.com/)

**APIs REST:**
- [RESTful API Design - Best Practices](https://www.freecodecamp.org/news/rest-api-design-best-practices-build-a-rest-api/)

---

## ❓ Preguntas Frecuentes

### ¿Necesito saber SQL?

**No es necesario.** Prisma genera el SQL automáticamente. Pero entender SQL básico te ayudará a comprender mejor lo que sucede "bajo el capó".

### ¿Puedo usar esto en producción?

**Sí, pero...** este proyecto es educativo. Para producción deberías agregar:
- Tests unitarios y de integración
- Logging apropiado
- Rate limiting
- Monitoreo y alertas
- Variables de entorno más seguras

### ¿Por qué NestJS y no Express?

**Express** es minimalista, te da libertad total pero poca estructura.

**NestJS** es opinado, te da una arquitectura probada y escalable desde el día 1.

Para proyectos grandes y equipos, NestJS es superior.

### ¿Qué es un "monorepo"?

Es un repositorio que contiene **múltiples aplicaciones** (backend, frontend, mobile) en carpetas separadas pero compartiendo configuración y dependencias.

**Ventajas:**
- Un solo repositorio para todo
- Compartir código fácilmente
- Versionado unificado

### ¿Por qué PostgreSQL y no MongoDB?

Para finanzas, necesitamos:
- **Transacciones ACID** (atomicidad, consistencia)
- **Relaciones fuertes** entre datos
- **Integridad referencial**

PostgreSQL es ideal para datos estructurados y relacionales.

---

## 🚀 Próximos Pasos

Ahora que entendés el panorama general:

1. **[Seguí con el Setup Guide →](./01-SETUP-GUIDE.md)**
   
   Instalaremos todo paso a paso desde cero.

2. **[Explorá la Arquitectura →](./02-ARCHITECTURE.md)**
   
   Entendé cómo está organizado el código.

3. **[Probá la API →](./06-API-REFERENCE.md)**
   
   Experimentá con los endpoints.

---

## 💬 ¿Dudas?

Si algo no está claro:
1. Revisá la documentación de la tecnología específica
2. Abrí un issue en GitHub
3. Experimentá con el código

**Recordá:** La mejor forma de aprender es haciendo. No tengas miedo de romper cosas, para eso tenemos Git 😉

---

<p align="center">
  <strong>¡Empecemos el viaje! 🚀</strong>
</p>
