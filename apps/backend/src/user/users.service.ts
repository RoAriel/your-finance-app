import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // 1. Extraemos password (para hashear) y currency (para default)
    // 'userData' ahora SOLO tiene email, firstName, lastName, role, etc.
    const { password, currency, ...userData } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        // 2. Esparcimos los datos limpios (email, names, etc.)
        ...userData,

        // 3. Asignamos los valores procesados
        password: hashedPassword,
        currency: currency || 'ARS',

        // Sugerencia: Como es creación manual, fuerza el provider
        authProvider: 'LOCAL',
      },
    });
  }

  // Obtener perfil (sin password)
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Eliminamos la password antes de devolverlo (Seguridad)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  // Actualizar perfil
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    // Devolvemos todos los usuarios sin el password
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;
      return rest;
    });
  }

  async remove(id: string) {
    // Verificamos existencia
    await this.findOne(id);

    // Gracias al onDelete: Cascade en el Schema, esto borra todo lo relacionado
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updatePassword(id: string, newPasswordRaw: string) {
    await this.findOne(id); // Verificar existencia

    const hashedPassword = await bcrypt.hash(newPasswordRaw, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }
}
