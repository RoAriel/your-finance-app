import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthProvider, AccountType, Prisma } from '@prisma/client'; // 👈 Importamos Prisma
import { DEFAULT_CATEGORIES_HIERARCHY } from '../common/constants/default-categories';
import { GoogleUser } from './interfaces/google-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password, firstName, lastName, currency = 'ARS' } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transacción
    const newUser = await this.prisma.$transaction(
      async (tx) => {
        // 1. Crear Usuario
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            currency,
            fiscalStartDay: 1,
            authProvider: AuthProvider.LOCAL,
          },
        });

        // 2. Inicializar Activos (DRY ♻️)
        await this.initializeUserAssets(tx, user.id, currency);

        return user;
      },
      {
        maxWait: 5000,
        timeout: 20000,
      },
    );

    const token = this.generateToken(newUser.id, newUser.email);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        currency: newUser.currency,
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    };
  }

  generateToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  async validateGoogleUser(googleUser: GoogleUser) {
    const { email, firstName, lastName, googleId, picture } = googleUser;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Usuario Existe -> Actualizar datos de Google
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          authProvider:
            user.authProvider === 'LOCAL' ? 'GOOGLE' : user.authProvider,
          authProviderId: googleId,
          avatarUrl: picture,
        },
      });
    } else {
      // Usuario Nuevo -> Crear con transacción
      user = await this.prisma.$transaction(
        async (tx) => {
          // A. Crear User
          const newUser = await tx.user.create({
            data: {
              email,
              firstName,
              lastName,
              authProvider: AuthProvider.GOOGLE,
              authProviderId: googleId,
              avatarUrl: picture,
              password: null,
              currency: 'ARS',
              fiscalStartDay: 1,
            },
          });

          // B. Inicializar Activos (DRY ♻️)
          await this.initializeUserAssets(tx, newUser.id, 'ARS');

          return newUser;
        },
        {
          maxWait: 5000,
          timeout: 20000,
        },
      );
    }

    return user;
  }

  /**
   * Método privado para crear la Billetera Default y las Categorías Iniciales.
   * Se reutiliza tanto en Registro Local como en Google Auth.
   */
  private async initializeUserAssets(
    tx: Prisma.TransactionClient, // Recibimos la transacción actual
    userId: string,
    currency: string,
  ) {
    // 1. Crear Billetera Default
    await tx.account.create({
      data: {
        name: 'Efectivo / Billetera',
        userId,
        type: AccountType.WALLET,
        currency,
        icon: 'wallet',
        color: '#10B981',
        balance: 0,
        isDefault: true,
      },
    });

    // 2. Crear Categorías Iniciales
    for (const catData of DEFAULT_CATEGORIES_HIERARCHY) {
      const parent = await tx.category.create({
        data: {
          name: catData.name,
          type: catData.type, // Ya tipado correctamente gracias a tu fix anterior
          color: catData.color,
          icon: catData.icon,
          isFixed: catData.isFixed,
          userId,
        },
      });

      if (catData.children && catData.children.length > 0) {
        await tx.category.createMany({
          data: catData.children.map((child) => ({
            name: child.name,
            type: child.type,
            color: child.color,
            icon: child.icon,
            isFixed: child.isFixed,
            parentId: parent.id,
            userId,
          })),
        });
      }
    }
  }
}
