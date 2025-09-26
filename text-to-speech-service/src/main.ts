import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AppModule,
    {
      useFactory: (configService: ConfigService) => ({
        transport: Transport.TCP,
        options: {
          host: configService.get<string>('HOST') || 'localhost',
          port: configService.get<number>('PORT') || 3005,
        },
      }),
      inject: [ConfigService],
    },
  );

  await app.listen();

  const configService = app.get(ConfigService);
  const runningPort = configService.get<number>('PORT');
  console.log(`Text to speech service is running on port ${runningPort}`);
}

bootstrap();
