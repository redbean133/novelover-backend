import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { AIService } from './ai.service';

@Module({
  imports: [SharedModule],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
