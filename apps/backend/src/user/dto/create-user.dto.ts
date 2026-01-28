import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Email único del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nombre completo' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Contraseña (se hasheará en el servicio)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'Moneda por defecto', default: 'ARS' })
  @IsOptional()
  @IsString()
  currency?: string;
}
