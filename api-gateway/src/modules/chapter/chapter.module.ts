import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';
import { MyChapterController } from './myChapter.controller';
import { MyChapterService } from './myChapter.service';
import { MediaModule } from '../media/media.module';
import { AIModule } from '../ai/ai.module';
import { AudioGateway } from './audio.gateway';

@Module({
  imports: [SharedModule, AIModule, MediaModule],
  controllers: [ChapterController, MyChapterController],
  providers: [ChapterService, MyChapterService, AudioGateway],
  exports: [ChapterService, MyChapterService],
})
export class ChapterModule {}
