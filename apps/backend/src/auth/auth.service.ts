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
import { AccountType } from '@prisma/client';
import { DEFAULT_CATEGORIES_HIERARCHY } from '../common/constants/default-categories';

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

    // Utilizamos una transacción para asegurar que se cree todo o nada
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
          },
        });

        // 2. Crear Billetera Default
        await tx.account.create({
          data: {
            name: 'Efectivo / Billetera',
            userId: user.id,
            type: AccountType.WALLET,
            currency: currency,
            icon: 'wallet',
            color: '#10B981',
            balance: 0,
            isDefault: true,
          },
        });

        // 3. Crear Categorías Iniciales
        for (const catData of DEFAULT_CATEGORIES_HIERARCHY) {
          const parent = await tx.category.create({
            data: {
              name: catData.name,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              type: catData.type as any,
              color: catData.color,
              icon: catData.icon,
              isFixed: catData.isFixed,
              userId: user.id,
            },
          });

          if (catData.children && catData.children.length > 0) {
            await tx.category.createMany({
              data: catData.children.map((child) => ({
                name: child.name,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                type: child.type as any,
                color: child.color,
                icon: child.icon,
                isFixed: child.isFixed,
                parentId: parent.id,
                userId: user.id,
              })),
            });
          }
        }

        return user;
      },
      {
        maxWait: 5000, // Tiempo máx esperando conexión del pool
        timeout: 20000, // Tiempo máx para ejecutar toda la transacción (por la latencia de DB)
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

    // ✨ Validación extra: Si el usuario existe pero no tiene password
    // (ej: se creó con Google), no podemos hacer login local.
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

  private generateToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
