import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TtsModule } from './modules/tts/tts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TtsModule,
  ],
})
export class AppModule {}
