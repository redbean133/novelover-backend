import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'user.send-verify-email' })
  async sendVerificationEmail(data: { email: string; token: string }) {
    return this.appService.sendVerificationEmail(data);
  }
}
