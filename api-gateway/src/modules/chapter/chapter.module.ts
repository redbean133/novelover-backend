import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';
import { MyChapterController } from './myChapter.controller';
import { MyChapterService } from './myChapter.service';

@Module({
  imports: [SharedModule],
  controllers: [ChapterController, MyChapterController],
  providers: [ChapterService, MyChapterService],
  exports: [ChapterService, MyChapterService],
})
export class ChapterModule {}
