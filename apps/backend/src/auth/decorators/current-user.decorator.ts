// src/auth/decorators/current-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para obtener el usuario autenticado desde el request
 *
 * @example
 * // Obtener usuario completo
 * async method(@CurrentUser() user: User) { ... }
 *
 * @example
 * // Obtener solo el ID
 * async method(@CurrentUser('id') userId: string) { ... }
 *
 * @example
 * // Obtener solo el email
 * async method(@CurrentUser('email') email: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si no hay usuario (error de auth), retornar undefined
    if (!user) {
      return undefined;
    }

    // Si se especifica una propiedad, devolverla
    return data ? user[data] : user;
  },
);
