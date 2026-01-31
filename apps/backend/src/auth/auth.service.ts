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
// 👇 Importamos el Enum
import { AccountType } from '@prisma/client';

// 📋 LISTA DE CATEGORÍAS DEFAULT (KIT DE BIENVENIDA)
const DEFAULT_CATEGORIES = [
  // INGRESOS
  {
    name: 'Sueldo',
    type: 'INCOME',
    icon: 'briefcase',
    color: '#10B981',
    isFixed: true,
  },
  {
    name: 'Ahorros',
    type: 'INCOME',
    icon: 'briefcase',
    color: '#10B981',
    isFixed: true,
  },
  // GASTOS
  {
    name: 'Café / Restaurante',
    type: 'EXPENSE',
    icon: 'cart',
    color: '#F59E0B',
    isFixed: false,
  },
  {
    name: 'Transporte',
    type: 'EXPENSE',
    icon: 'bus',
    color: '#3B82F6',
    isFixed: false,
  },
  {
    name: 'Servicios',
    type: 'EXPENSE',
    icon: 'bulb',
    color: '#EF4444',
    isFixed: true,
  },
  {
    name: 'Alquiler / Casa',
    type: 'EXPENSE',
    icon: 'home',
    color: '#8B5CF6',
    isFixed: true,
  },
  {
    name: 'Ocio / Salidas',
    type: 'EXPENSE',
    icon: 'party',
    color: '#EC4899',
    isFixed: false,
  },
  {
    name: 'Salud',
    type: 'EXPENSE',
    icon: 'heart',
    color: '#EF4444',
    isFixed: false,
  },
  {
    name: 'Supermercado',
    type: 'EXPENSE',
    icon: 'shopping-cart',
    color: '#10B981',
    isFixed: false,
  },
];

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password, name, currency = 'ARS' } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. TRANSACCIÓN: Usuario + Cuenta WALLET Default + Categorías
    const newUser = await this.prisma.$transaction(async (tx) => {
      // A. Crear Usuario
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          currency,
          fiscalStartDay: 1,
        },
      });

      // B. Crear su Billetera Principal (WALLET)
      await tx.account.create({
        // 👈 Usamos tx.account
        data: {
          name: 'Efectivo / Billetera',
          userId: user.id,
          type: AccountType.WALLET, // 👈 Identidad explícita
          currency: currency,
          icon: 'wallet',
          color: '#10B981',
          balance: 0,
          isDefault: true,
        },
      });

      // C. Crear Categorías Básicas
      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          userId: user.id,
        })),
      });
      return user;
    });

    const token = this.generateToken(newUser.id, newUser.email);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        currency: newUser.currency,
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    // ... (Tu código de login se mantiene igual)
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email);

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
    const payload: JwtPayload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
