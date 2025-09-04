import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/user.entity';
import { RefreshToken } from './refreshToken.entity';
import { parseTimeToMilliseconds } from 'src/utils/datetime';
import { GoogleAuthService } from './googleAuth.service';
import { randomUUID } from 'crypto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  // Validate user account by username and password
  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Tài khoản không tồn tại',
      });

    const validateSuccess = await bcrypt.compare(password, user.passwordDigest);
    if (!validateSuccess)
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Mật khẩu không chính xác',
      });

    return user;
  }

  // Implement Google OAuth validation logic
  async validateByGoogleCode(code: string): Promise<User> {
    const tokens = await this.googleAuthService.getTokensFromCode(code);
    if (!tokens || !tokens.id_token) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Xác thực tài khoản Google thất bại',
      });
    }
    const payload = await this.googleAuthService.verifyIdToken(tokens.id_token);
    const {
      sub: providerId,
      email,
      email_verified: emailVerified,
      name,
      picture,
    } = payload;

    if (!emailVerified) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Tài khoản chưa được xác minh bởi Google',
      });
    }

    let user = await this.userRepository.findOne({ where: { providerId } });
    if (user) return user;

    user = await this.userRepository.findOne({
      where: { email, emailVerified: true },
    });
    if (!user) {
      const newUser = this.userRepository.create({
        username: `user${randomUUID().slice(0, 8)}`,
        displayName: name,
        email,
        emailVerified: true,
        avatarUrl: picture,
        providerId,
        providerType: 'Google',
      });
      await this.userRepository.save(newUser);
      return newUser;
    }

    user.providerId = providerId;
    user.providerType = 'Google';
    return await this.userRepository.save(user);
  }

  // Issue new access and refresh tokens
  async issueTokens(user: User) {
    const accessTokenSecret = this.configService.get<string>('JWT_AT_SECRET');
    const refreshTokenSecret = this.configService.get<string>('JWT_RT_SECRET');
    const accessTokenExp =
      this.configService.get<string>('JWT_AT_EXPIRES') || '1h';
    const refreshTokenExp =
      this.configService.get<string>('JWT_RT_EXPIRES') || '7d';

    const payload = { sub: user.id, username: user.username, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessTokenSecret,
        expiresIn: accessTokenExp,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshTokenSecret,
        expiresIn: refreshTokenExp,
      }),
    ]);

    const now = new Date();
    const refreshTokenExpiresAt = new Date(
      now.getTime() + parseTimeToMilliseconds(refreshTokenExp),
    );

    return { accessToken, refreshToken, refreshTokenExpiresAt };
  }

  // Update or insert a device's refresh token
  async upsertDeviceRefreshToken(
    userId: string,
    deviceId: string,
    refreshToken: string,
    expiresAt: Date,
  ) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const refreshTokenRecord = await this.refreshTokenRepository.findOne({
      where: { userId: userId, deviceId: deviceId },
    });
    if (refreshTokenRecord) {
      refreshTokenRecord.tokenHash = refreshTokenHash;
      refreshTokenRecord.expiresAt = expiresAt;
      refreshTokenRecord.revokedAt = null;
      await this.refreshTokenRepository.save(refreshTokenRecord);
    } else {
      await this.refreshTokenRepository.save(
        this.refreshTokenRepository.create({
          userId: userId,
          deviceId: deviceId,
          tokenHash: refreshTokenHash,
          expiresAt: expiresAt,
        }),
      );
    }
  }

  // Rotate refresh token
  async rotateRefreshToken(
    userId: string,
    deviceId: string,
    providedRefreshToken: string,
  ) {
    const record = await this.refreshTokenRepository.findOne({
      where: { userId: userId, deviceId: deviceId },
    });

    if (!record || record.revokedAt)
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Refresh token đã bị thu hồi',
      });

    if (record.expiresAt <= new Date())
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Refresh token đã hết hạn',
      });

    const isValidRefreshToken = await bcrypt.compare(
      providedRefreshToken,
      record.tokenHash,
    );

    if (!isValidRefreshToken)
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Refresh token không hợp lệ',
      });

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy tài khoản người dùng',
      });

    const { accessToken, refreshToken, refreshTokenExpiresAt } =
      await this.issueTokens(user);

    const newRefreshTokenHash = await bcrypt.hash(refreshToken, 10);
    record.tokenHash = newRefreshTokenHash;
    record.expiresAt = refreshTokenExpiresAt;
    record.revokedAt = null;
    await this.refreshTokenRepository.save(record);

    return { accessToken, refreshToken };
  }

  // Revoke refresh token of current user in one device by device ID
  async revokeTokenOneDevice(userId: string, deviceId: string) {
    const record = await this.refreshTokenRepository.findOne({
      where: { userId: userId, deviceId: deviceId },
    });

    if (record) {
      record.revokedAt = new Date();
      await this.refreshTokenRepository.save(record);
    }
  }

  // Revoke refresh token of current user in all devices
  async revokeTokenAllDevices(userId: string) {
    const now = new Date();
    await this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: now })
      .where('user_id = :userId', { userId })
      .andWhere('revoked_at IS NULL')
      .execute();
  }
}
