import { MailerService } from '@nestjs-modules/mailer';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(private readonly mailer: MailerService) {}

  async sendVerificationEmail(data: { email: string; token: string }) {
    const url = `http://192.168.28.149:5173/email-verify?token=${data.token}`;
    try {
      await this.mailer.sendMail({
        to: data.email,
        subject: '[Novelover] Xác thực địa chỉ email',
        template: './verifyEmailTemplate',
        context: { url },
      });

      return {
        success: true,
        message:
          'Liên kết xác thực đã được gửi tới email của bạn. Liên kết này có hiệu lực trong 10 phút.',
      };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error sending verification email',
      });
    }
  }
}
