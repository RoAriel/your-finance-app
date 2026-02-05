import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from '@prisma/client'; // Asegúrate de tener esto generado

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  // ✨ CAMBIO CRÍTICO: Reemplazamos 'name' por estos dos
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  // Opcionales
  @IsOptional()
  @IsString()
  currency?: string = 'ARS';

  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.USER;
}
