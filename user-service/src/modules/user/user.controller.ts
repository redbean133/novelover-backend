import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { UpdateUserDTO } from './dto/updateUser.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'user.register' })
  async register(@Payload() createUserDto: CreateUserDto): Promise<any> {
    return await this.userService.register(createUserDto);
  }

  @MessagePattern({ cmd: 'user.get-information' })
  async getInformation(@Payload() userId: string): Promise<any> {
    return this.userService.getInformation(userId);
  }

  @MessagePattern({ cmd: 'user.verify-email' })
  async verifyEmail(@Payload() token: string): Promise<any> {
    return this.userService.verifyEmail(token);
  }

  @MessagePattern({ cmd: 'user.send-verify-email' })
  async sendVerifyEmail(
    @Payload() payload: { userId: string; email: string },
  ): Promise<any> {
    return firstValueFrom(
      await this.userService.sendVerifyEmail(payload.userId, payload.email),
    );
  }

  @MessagePattern({ cmd: 'user.update-information' })
  async updateInformation(
    @Payload()
    { userId, updateData }: { userId: string; updateData: UpdateUserDTO },
  ): Promise<any> {
    return this.userService.updateInformation(userId, updateData);
  }

  @MessagePattern({ cmd: 'user.update-password' })
  async updatePassword(
    @Payload()
    {
      userId,
      currentPassword,
      newPassword,
    }: {
      userId: string;
      currentPassword: string;
      newPassword: string;
    },
  ): Promise<any> {
    return this.userService.updatePassword(
      userId,
      currentPassword,
      newPassword,
    );
  }
}
