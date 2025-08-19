import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import type { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { LocalLoginDto } from './dto/localLogin.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await firstValueFrom(this.userService.registerUser(createUserDto));
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('/login')
  async login(
    @Body() loginDto: LocalLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { deviceId, accessToken, refreshToken } = await firstValueFrom(
        this.userService.login({
          ...loginDto,
          deviceId: req.cookies?.['device-id'] as string,
        }),
      );

      res.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 3600 * 1000,
        path: '/user/refresh-token',
      });

      res.cookie('device-id', deviceId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 365 * 24 * 3600 * 1000,
        path: '/user/refresh-token',
      });

      return {
        accessToken,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('refresh-token')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const providedRefreshToken = req.cookies['refresh-token'] as string;
    if (!providedRefreshToken)
      throw new BadRequestException('Missing refresh token');

    const refreshTokenSecret = this.configService.get<string>('JWT_RT_SECRET');
    if (!refreshTokenSecret)
      throw new Error('JWT refresh token secret is not configured');

    const payload = await this.jwtService.verifyAsync(providedRefreshToken, {
      secret: refreshTokenSecret,
    });

    const userId = payload.sub;
    const deviceId = req.cookies?.['device-id'] as string;
    if (!userId || !deviceId)
      throw new BadRequestException('Missing user id or device id');

    // Rotate token
    const { accessToken, refreshToken } = await firstValueFrom(
      this.userService.refreshToken({
        userId,
        deviceId,
        refreshToken: providedRefreshToken,
      }),
    );

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 3600 * 1000,
      path: '/user/refresh-token',
    });

    return { accessToken };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = (req as any).user.sub as string;
    if (!userId) throw new BadRequestException('User not identified');

    const deviceId = req.cookies?.['device-id'] as string;
    if (!deviceId) throw new BadRequestException('Missing deviceId');

    await firstValueFrom(this.userService.logout({ userId, deviceId }));

    res.clearCookie('refresh-token', { path: '/user/refresh-token' });
    return { success: true };
  }

  @UseGuards(AuthGuard)
  @Post('logout-all-devices')
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = (req as any).user.sub as string;
    if (!userId) throw new BadRequestException('User not identified');

    await firstValueFrom(this.userService.logoutAllDevices({ userId }));

    res.clearCookie('refresh-token', { path: '/user/refresh-token' });
    return { success: true };
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getUserInfo(@Req() req: Request, @Param('id') userId: string) {
    try {
      const currentUserId = (req as any).user.sub as string;
      if (currentUserId !== userId)
        throw new ForbiddenException('Access denied');

      const user = await firstValueFrom(this.userService.getUserInfo(userId));
      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
