import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';
import { MyChapterController } from './myChapter.controller';
import { MyChapterService } from './myChapter.service';
import { TtsModule } from '../tts/tts.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [SharedModule, TtsModule, MediaModule],
  controllers: [ChapterController, MyChapterController],
  providers: [ChapterService, MyChapterService],
  exports: [ChapterService, MyChapterService],
})
export class ChapterModule {}
