import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NovelModule } from './novel/novel.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    NovelModule,
  ],
})
export class AppModule {}
