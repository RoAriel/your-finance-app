import {
  PrismaClient,
  Role,
  SubscriptionTier,
  AccountType,
  AuthProvider, // 👈 Importante: Importar el nuevo Enum
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@admin.com';
  const passwordRaw = 'admin123'; // Contraseña para el login

  // 1. Verificar si ya existe
  const existingAdmin = await prisma.user.findUnique({ where: { email } });

  if (!existingAdmin) {
    console.log('⚡ Creando usuario Admin...');

    // Hasheamos la contraseña
    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    // 2. Crear Admin + Cuenta Default
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,

        // ✨ CAMBIO 1: Nombre separado
        firstName: 'Super',
        lastName: 'Admin',

        // ✨ CAMBIO 2: Definir el proveedor (Local = Email/Pass)
        authProvider: AuthProvider.LOCAL,

        role: Role.ADMIN,
        subscription: SubscriptionTier.PRO,

        // Preferencias
        currency: 'ARS',
        fiscalStartDay: 1,
        timezone: 'America/Argentina/Buenos_Aires', // Buena práctica agregarlo

        // Crear su billetera inicial
        accounts: {
          create: {
            name: 'Caja Chica (Admin)',
            type: AccountType.WALLET,
            currency: 'ARS',
            icon: 'shield-check',
            color: '#000000',
            isDefault: true,
            balance: 0,
          },
        },
      },
    });

    console.log(`✅ Admin creado exitosamente:`);
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Pass:  ${passwordRaw}`);
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
