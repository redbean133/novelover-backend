import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const configService = app.get(ConfigService);
  const httpPort = configService.get<number>('HTTP_PORT') || 3006;
  await app.listen(httpPort);
  console.log(`HTTP AI microservice running on port ${httpPort}`);

  const microservice = app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: configService.get<string>('HOST') || 'localhost',
      port: configService.get<number>('TCP_PORT') || 3005,
    },
  });
  await microservice.listen();
  console.log(
    `TCP AI microservice running on ${configService.get<number>('TCP_PORT')}`,
  );
}

bootstrap();
