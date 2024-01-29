import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RoleEnum } from '@prisma/client';
import { ROLES_KEY } from '../decorator/roles.decorator';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();

    const hasRole = () =>
      requiredRoles.some((role) => request.user.UserRole?.includes(role));
    if (request.user && hasRole()) {
      return true;
    }
    throw new ForbiddenException(
      'No tienes permiso para acceder a este recurso',
    );
  }
}
