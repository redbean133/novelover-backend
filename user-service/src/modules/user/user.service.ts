import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { omit } from 'lodash';
import { IAccessTokenPayload } from 'src/common/interface/IAccessTokenPayload';
import { UpdateUserDTO } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('EMAIL_SERVICE') private readonly emailServiceClient: ClientProxy,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<any> {
    const { displayName, username, password } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: 'Tài khoản đã tồn tại',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      username,
      passwordDigest: hashedPassword,
      displayName,
    });

    const userRecord = await this.userRepository.save(newUser);
    const userWithoutPassword = omit(userRecord, ['passwordDigest']);
    return userWithoutPassword;
  }

  async getInformation(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy tài khoản người dùng',
      });

    const userWithoutPassword = omit(user, ['passwordDigest']);
    return userWithoutPassword;
  }

  async sendVerifyEmail(userId: string, email: string): Promise<any> {
    const isUsedEmail = await this.userRepository.findOne({
      where: { email, emailVerified: true },
    });

    if (isUsedEmail) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: 'Email đã được liên kết với tài khoản khác',
      });
    }

    await this.userRepository.update(userId, {
      email,
      emailVerified: false,
    });
    const verifyEmailTokenSecret = this.configService.get<string>(
      'JWT_EMAIL_VERIFY_TOKEN_SECRET',
    );
    console.log(verifyEmailTokenSecret);
    const verifyEmailTokenExp =
      this.configService.get<string>('JWT_EMAIL_VERIFY_TOKEN_EXPIRES') || '10m';
    console.log(verifyEmailTokenExp);
    const token = await this.jwtService.signAsync(
      { sub: userId },
      {
        expiresIn: verifyEmailTokenExp,
        secret: verifyEmailTokenSecret,
      },
    );
    console.log(email, token);
    return this.emailServiceClient.send(
      { cmd: 'user.send-verify-email' },
      { email, token },
    );
  }

  async verifyEmail(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync<IAccessTokenPayload>(
        token,
        {
          secret: this.configService.get<string>(
            'JWT_EMAIL_VERIFY_TOKEN_SECRET',
          ),
        },
      );
      const userId = payload.sub;
      await this.userRepository.update(userId, { emailVerified: true });
      return { success: true, message: 'Liên kết email thành công' };
    } catch {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token không hợp lệ hoặc đã hết hạn',
      });
    }
  }

  async updateInformation(
    userId: string,
    updateData: UpdateUserDTO,
  ): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy tài khoản người dùng',
      });

    Object.assign(user, updateData);
    const updatedUser = await this.userRepository.save(user);

    const userWithoutPassword = omit(updatedUser, ['passwordDigest']);
    return userWithoutPassword;
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy tài khoản người dùng',
      });

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordDigest,
    );
    if (!isPasswordValid)
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Mật khẩu hiện tại không chính xác',
      });

    user.passwordDigest = await bcrypt.hash(newPassword, 10);
    const updatedUser = await this.userRepository.save(user);
    if (updatedUser) return { success: true };
  }
}
