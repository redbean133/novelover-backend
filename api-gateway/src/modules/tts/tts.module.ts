import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { TtsService } from './tts.service';

@Module({
  imports: [SharedModule],
  providers: [TtsService],
  exports: [TtsService],
})
export class TtsModule {}
