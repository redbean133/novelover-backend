import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/user.entity';
import { RefreshToken } from './refreshToken.entity';
import { GoogleAuthService } from './googleAuth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.register({}),
  ],
  providers: [AuthService, GoogleAuthService],
  controllers: [AuthController],
})
export class AuthModule {}
