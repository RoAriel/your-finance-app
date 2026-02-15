import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController, AdminController],
  providers: [UsersService],
  exports: [UsersService], // 👈 Exportamos el servicio por si Auth lo necesita
})
export class UsersModule {}
