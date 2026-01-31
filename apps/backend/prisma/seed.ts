import {
  PrismaClient,
  Role,
  SubscriptionTier,
  AccountType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@admin';

  // 1. Verificar si ya existe
  const existingAdmin = await prisma.user.findUnique({ where: { email } });

  if (!existingAdmin) {
    console.log('⚡ Creando usuario Admin...');
    const hashedPassword = await bcrypt.hash('admin', 10);

    // 2. Crear Admin + Cuenta Default protegida
    await prisma.user.create({
      data: {
        email,
        name: 'Super Admin',
        password: hashedPassword,
        role: Role.ADMIN,
        subscription: SubscriptionTier.PRO,
        currency: 'ARS',
        fiscalStartDay: 1,
        accounts: {
          create: {
            name: 'Caja Chica (Admin)',
            type: AccountType.WALLET, // 👈 Definimos el tipo
            currency: 'ARS',
            icon: 'shield-check',
            color: '#000000',
            isDefault: true,
          },
        },
      },
    });
    console.log(`✅ Admin creado exitosamente: ${email} / admin123`);
  } else {
    console.log('ℹ️ El usuario Admin ya existe. No se hicieron cambios.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
