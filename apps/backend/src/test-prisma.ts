// apps/backend/src/test-prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear un usuario de prueba
  const user = await prisma.user.create({
    data: {
      email: 'test2@example.com',
      password: 'hashed_password_here',
      name: 'Test User2',
    },
  });

  console.log('✅ Usuario creado:', user);

  // Buscar todos los usuarios
  const users = await prisma.user.findMany();
  console.log('📋 Todos los usuarios:', users);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
