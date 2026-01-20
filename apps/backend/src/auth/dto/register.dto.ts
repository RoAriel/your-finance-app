import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'any@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan Perez',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
