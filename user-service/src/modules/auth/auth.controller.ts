import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LocalLoginDto } from './dto/localLogin.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { LogoutDto } from './dto/logout.dto';
import { LogoutAllDto } from './dto/logoutAllDevices.dto';
import { getRandomId } from 'src/utils/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'user.login' })
  async login(@Payload() localLoginDto: LocalLoginDto) {
    const {
      username,
      password,
      deviceId = getRandomId('device_'),
    } = localLoginDto;
    const user = await this.authService.validateUser(username, password);
    const { accessToken, refreshToken, refreshTokenExpiresAt } =
      await this.authService.issueTokens(user);
    await this.authService.upsertDeviceRefreshToken(
      user.id,
      deviceId,
      refreshToken,
      refreshTokenExpiresAt,
    );
    return {
      deviceId,
      accessToken,
      refreshToken,
    };
  }

  @MessagePattern({ cmd: 'user.google-login' })
  async loginWithGoogle(
    @Payload() payload: { code: string; deviceId?: string },
  ) {
    const { code, deviceId = getRandomId('device_') } = payload;
    const user = await this.authService.validateByGoogleCode(code);
    const { accessToken, refreshToken, refreshTokenExpiresAt } =
      await this.authService.issueTokens(user);
    await this.authService.upsertDeviceRefreshToken(
      user.id,
      deviceId,
      refreshToken,
      refreshTokenExpiresAt,
    );
    return {
      deviceId,
      accessToken,
      refreshToken,
    };
  }

  @MessagePattern({ cmd: 'user.refresh-token' })
  async refreshToken(@Payload() refreshTokenDto: RefreshTokenDto) {
    const { accessToken, refreshToken } =
      await this.authService.rotateRefreshToken(
        refreshTokenDto.userId,
        refreshTokenDto.deviceId,
        refreshTokenDto.refreshToken,
      );
    return { accessToken, refreshToken };
  }

  @MessagePattern({ cmd: 'user.logout' })
  async logout(@Payload() logoutDto: LogoutDto) {
    const { userId, deviceId } = logoutDto;
    await this.authService.revokeTokenOneDevice(userId, deviceId);
    return { success: true };
  }

  @MessagePattern({ cmd: 'user.logout-all' })
  async logoutAll(@Payload() logoutAllDto: LogoutAllDto) {
    await this.authService.revokeTokenAllDevices(logoutAllDto.userId);
    return { success: true };
  }
}
