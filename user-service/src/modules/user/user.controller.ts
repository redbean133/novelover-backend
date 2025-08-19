import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'user.register' })
  async register(@Payload() createUserDto: CreateUserDto): Promise<any> {
    try {
      return await this.userService.register(createUserDto);
    } catch (e) {
      throw new RpcException(e);
    }
  }

  @MessagePattern({ cmd: 'user.get-information' })
  async getInformation(@Payload() userId: string): Promise<any> {
    return this.userService.getInformation(userId);
  }
}
