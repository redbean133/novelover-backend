import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from '../shared/shared.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [JwtModule.register({}), SharedModule, MediaModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
