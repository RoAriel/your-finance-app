import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role, User } from '@prisma/client'; // 👈 Importamos User y Role
import { Request } from 'express'; // 👈 Importamos Request

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    // 👇 TIPADO SEGURO: Le decimos a TS que el Request trae un User de Prisma
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User }>();
    const user = request.user;

    // Validación defensiva por si user es undefined (ej: ruta pública sin AuthGuard)
    if (!user) return false;

    return requiredRoles.some((role) => user.role === role);
  }
}
