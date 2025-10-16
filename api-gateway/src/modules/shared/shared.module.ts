import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({}),
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('USER_SERVICE_HOST') || 'localhost',
            port: configService.get<number>('USER_SERVICE_PORT') || 3001,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'NOVEL_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host:
              configService.get<string>('NOVEL_SERVICE_HOST') || 'localhost',
            port: configService.get<number>('NOVEL_SERVICE_PORT') || 3002,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'EMAIL_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host:
              configService.get<string>('EMAIL_SERVICE_HOST') || 'localhost',
            port: configService.get<number>('EMAIL_SERVICE_PORT') || 3003,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'MEDIA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host:
              configService.get<string>('MEDIA_SERVICE_HOST') || 'localhost',
            port: configService.get<number>('MEDIA_SERVICE_PORT') || 3004,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'AI_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host:
              configService.get<string>('AI_SERVICE_TCP_HOST') || 'localhost',
            port: configService.get<number>('AI_SERVICE_TCP_PORT') || 3005,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'CRAWLER_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host:
              configService.get<string>('CRAWLER_SERVICE_HOST') || 'localhost',
            port: configService.get<number>('CRAWLER_SERVICE_PORT') || 3007,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule, JwtModule],
})
export class SharedModule {}
