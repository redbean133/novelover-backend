import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './apiGateway.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { RpcToHttpExceptionFilter } from './common/filter/RpcToHttpExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  const configService = app.get(ConfigService);
  const runningPort = configService.get<number>('PORT') || 3000;

  app.use(cookieParser());

  app.enableCors({
    origin: ['http://192.168.239.149:5173'], // FE domain
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new RpcToHttpExceptionFilter());

  await app.listen(runningPort);

  console.log(`API Gateway is running on port ${runningPort}`);
}

bootstrap();
