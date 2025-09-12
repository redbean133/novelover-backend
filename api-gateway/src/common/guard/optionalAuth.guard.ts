import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IAccessTokenPayload } from '../interface/IAccessTokenPayload';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractTokenFromHeader(request);

    if (!accessToken) {
      request['user'] = null;
      return true;
    }

    const accessTokenSecret = this.configService.get<string>('JWT_AT_SECRET');
    if (!accessTokenSecret)
      throw new Error('JWT access token secret is not configured');

    try {
      const payload = await this.jwtService.verifyAsync<IAccessTokenPayload>(
        accessToken,
        {
          secret: accessTokenSecret,
        },
      );
      request['user'] = payload;
    } catch (error) {
      request['user'] = null;
      console.error('Token verification failed:', error);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
