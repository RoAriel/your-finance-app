import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) // 🔒 1. Requiere Login + Roles
@Roles(Role.ADMIN) // 🔒 2. Solo ADMIN pasa
@Controller('admin/users')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios (Solo Admin)' })
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario y sus datos (Solo Admin)' })
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Cambiar contraseña de un usuario (Solo Admin)' })
  @ApiBody({
    schema: { type: 'object', properties: { password: { type: 'string' } } },
  })
  changeUserPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('password') password: string,
  ) {
    return this.usersService.updatePassword(id, password);
  }
}
