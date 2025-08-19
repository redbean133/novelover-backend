import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
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
    try {
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
    } catch (e) {
      throw new RpcException(e);
    }
  }

  @MessagePattern({ cmd: 'user.refresh-token' })
  async refreshToken(@Payload() refreshTokenDto: RefreshTokenDto) {
    try {
      const { accessToken, refreshToken } =
        await this.authService.rotateRefreshToken(
          refreshTokenDto.userId,
          refreshTokenDto.deviceId,
          refreshTokenDto.refreshToken,
        );
      return { accessToken, refreshToken };
    } catch (e) {
      throw new RpcException(e);
    }
  }

  @MessagePattern({ cmd: 'user.logout' })
  async logout(@Payload() logoutDto: LogoutDto) {
    const { userId, deviceId } = logoutDto;
    try {
      await this.authService.revokeTokenOneDevice(userId, deviceId);
      return { success: true };
    } catch (e) {
      throw new RpcException(e);
    }
  }

  @MessagePattern({ cmd: 'user.logout-all' })
  async logoutAll(@Payload() logoutAllDto: LogoutAllDto) {
    try {
      await this.authService.revokeTokenAllDevices(logoutAllDto.userId);
      return { success: true };
    } catch (e) {
      throw new RpcException(e);
    }
  }
}
