import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { UserPayload } from './interfaces/user-payload.interface';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { User } from '@prisma/client';

interface RequestWithUser extends Request {
  user: User;
}
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // 👇 Nueva ruta protegida
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: UserPayload) {
    return {
      message: 'This is your profile',
      user,
    };
  }

  // 1. Inicia el flujo: Redirige al usuario a Google.com
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // El guard hace la magia, este método no necesita cuerpo
  }

  // 2. Callback: Google nos devuelve al usuario aquí
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Req() req: RequestWithUser, @Res() res: Response) {
    // 👇 Validación defensiva: Si por alguna razón user no existe, cortamos
    if (!req.user) {
      return res.redirect('http://localhost:5173/login?error=auth_failed');
    }

    const user = req.user;

    // Al usar user.id y user.email, TS ya sabe que existen por la interfaz User
    const token = this.authService.generateToken(user.id, user.email);

    // 👇 Forzamos el tipo string para calmar al linter sobre ConfigService
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';

    return res.redirect(`${frontendUrl}/oauth/callback?token=${token}`);
  }
}
