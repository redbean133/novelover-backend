import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { IAccessTokenPayload } from '../interface/IAccessTokenPayload';
import { UserRole } from 'src/modules/user/interface/IUser';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as IAccessTokenPayload;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    if (user.role !== UserRole.Admin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
