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
    // 1. Desestructuramos para obtener la moneda (con default ARS)
    const { email, password, name, currency = 'ARS' } = dto;

    // 2. Verificar si existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // 3. Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. TRANSACCIÓN: Usuario + Cuenta Default
    // Usamos $transaction para que si falla la cuenta, no se cree el usuario (Atomicidad)
    const newUser = await this.prisma.$transaction(async (tx) => {
      // A. Crear Usuario
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          currency, // Guardamos la preferencia de moneda
          fiscalStartDay: 1, // Default
          // Role y Subscription toman los defaults de la BD (USER, FREE)
        },
      });

      // B. Crear su Billetera Principal
      await tx.savingsAccount.create({
        data: {
          name: 'Efectivo / Billetera',
          userId: user.id,
          currency: currency, // Hereda la moneda del usuario
          icon: 'wallet',
          color: '#10B981', // Verde
          balance: 0,
          isDefault: true, // 🛡️ ¡Importante! Protegida contra borrado
        },
      });
      // C. Crear Categorías Básica
      // Usamos createMany para que sea súper eficiente (una sola query)
      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          userId: user.id,
        })),
      });
      return user;
    });

    // 5. Generar Token (Auto-login)
    const token = this.generateToken(newUser.id, newUser.email);

    // 6. Retornar respuesta
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
    // 1. Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Verificar password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Generar token
    const token = this.generateToken(user.id, user.email);

    // 4. Retornar usuario (sin password) y token
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
