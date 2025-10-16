import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  ForbiddenException,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import type { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { LocalLoginDto } from './dto/localLogin.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { IRequestWithUser } from 'src/common/interface/IRequestWithUser';
import { UpdateUserDTO } from './dto/updateUser.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { MediaService } from '../media/media.service';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import { OptionalAuthGuard } from 'src/common/guard/optionalAuth.guard';
import { CurrentUserId } from 'src/common/decorator/currentUserId.decorator';

@Controller('/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mediaService: MediaService,
  ) {}

  @Post('/register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return await firstValueFrom(this.userService.registerUser(createUserDto));
  }

  @Post('/login')
  async login(
    @Body() loginDto: LocalLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { deviceId, accessToken, refreshToken } = await firstValueFrom(
      this.userService.login({
        ...loginDto,
        deviceId: req.cookies?.['device-id'] as string,
      }),
    );

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 3600 * 1000,
      path: '/user/refresh-token',
    });

    res.cookie('device-id', deviceId, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 365 * 24 * 3600 * 1000,
      path: '/user/refresh-token',
    });

    return {
      accessToken,
    };
  }

  @Post('/google-login')
  async loginWithGoogle(
    @Body() body: { code: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { deviceId, accessToken, refreshToken } = await firstValueFrom(
      this.userService.loginWithGoogle({
        code: body.code,
        deviceId: req.cookies?.['device-id'] as string,
      }),
    );

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 3600 * 1000,
      path: '/user/refresh-token',
    });

    res.cookie('device-id', deviceId, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 365 * 24 * 3600 * 1000,
      path: '/user/refresh-token',
    });

    return {
      accessToken,
    };
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

    const payload = await this.jwtService.verifyAsync<{
      sub: string;
    }>(providedRefreshToken, {
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
      sameSite: 'none',
      maxAge: 7 * 24 * 3600 * 1000,
      path: '/user/refresh-token',
    });

    return { accessToken };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @Req() req: IRequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.sub;
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
    @Req() req: IRequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User not identified');

    await firstValueFrom(this.userService.logoutAllDevices({ userId }));

    res.clearCookie('refresh-token', { path: '/user/refresh-token' });
    return { success: true };
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getUserInfo(@Req() req: IRequestWithUser, @Param('id') userId: string) {
    const currentUserId = req.user.sub;
    if (currentUserId !== userId) throw new ForbiddenException('Access denied');

    const user = await firstValueFrom(this.userService.getUserInfo(userId));
    return user;
  }

  @UseGuards(AuthGuard)
  @Post(':id/send-verify-email')
  async sendVerifyEmail(
    @Req() req: IRequestWithUser,
    @Param('id') userId: string,
    @Body() body: { email: string },
  ) {
    const currentUserId = req.user.sub;
    if (currentUserId !== userId) throw new ForbiddenException('Access denied');

    return await firstValueFrom(
      this.userService.sendVerifyEmail(userId, body.email),
    );
  }

  @Post('/verify-email')
  async verifyEmail(@Body() body: { token: string }) {
    return await firstValueFrom(this.userService.verifyEmail(body.token));
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateUserInfo(
    @Req() req: IRequestWithUser,
    @Param('id') userId: string,
    @Body() updateData: UpdateUserDTO,
  ) {
    const currentUserId = req.user.sub;
    if (currentUserId !== userId) throw new ForbiddenException('Access denied');

    const user = await firstValueFrom(
      this.userService.updateUserInfo(userId, updateData),
    );
    return user;
  }

  @UseGuards(AuthGuard)
  @Patch(':id/update-password')
  async updatePassword(
    @Req() req: IRequestWithUser,
    @Param('id') userId: string,
    @Body() updateData: UpdatePasswordDto,
  ) {
    const currentUserId = req.user.sub;
    if (currentUserId !== userId) throw new ForbiddenException('Access denied');

    const result = await firstValueFrom(
      this.userService.updatePassword(userId, updateData),
    );
    return result;
  }

  @UseGuards(AuthGuard)
  @Patch(':id/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async updateUserImage(
    @Req() req: IRequestWithUser,
    @Param('id') userId: string,
    @Query('type') type: 'avatar' | 'cover',
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /^image\// })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const currentUserId = req.user.sub;
    if (currentUserId !== userId) throw new ForbiddenException('Access denied');

    const uploadResult = await firstValueFrom(
      this.mediaService.uploadMedia(
        file.buffer,
        'user-' + type,
        'image',
        `user-${userId}-${type}`,
      ),
    );

    const user = await firstValueFrom(
      this.userService.updateUserInfo(userId, {
        [type + 'Url']: uploadResult.url,
      }),
    );

    return user;
  }

  @UseGuards(AuthGuard)
  @Post('follow')
  follow(@Req() req: IRequestWithUser, @Body('targetId') targetId: string) {
    return this.userService.follow(req.user.sub, targetId);
  }

  @UseGuards(AuthGuard)
  @Delete('follow')
  unfollow(@Req() req: IRequestWithUser, @Query('targetId') targetId: string) {
    return this.userService.unfollow(req.user.sub, targetId);
  }

  @UseGuards(OptionalAuthGuard)
  @Get(':userId/followers')
  getFollowers(
    @Param('userId') userId: string,
    @CurrentUserId() currentUserId: string | null,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.userService.getFollowers(userId, currentUserId, {
      page,
      limit,
      search,
    });
  }

  @UseGuards(OptionalAuthGuard)
  @Get(':userId/following')
  getFollowing(
    @Param('userId') userId: string,
    @CurrentUserId() currentUserId: string | null,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.userService.getFollowing(userId, currentUserId, {
      page,
      limit,
      search,
    });
  }

  @UseGuards(AuthGuard)
  @Get(':targetId/follow/status')
  isFollowing(
    @Req() req: IRequestWithUser,
    @Param('targetId') targetId: string,
  ) {
    return this.userService.isFollowing(req.user.sub, targetId);
  }
}
