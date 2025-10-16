import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './chapter.entity';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { NovelModule } from '../novel/novel.module';
import { MyChapterController } from './myChapter.controller';
import { MyChapterService } from './myChapter.service';
import { ChapterVoteModule } from '../chapter-vote/chapterVote.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chapter]),
    NovelModule,
    ChapterVoteModule,
  ],
  providers: [ChapterService, MyChapterService],
  controllers: [ChapterController, MyChapterController],
  exports: [ChapterService, MyChapterService],
})
export class ChapterModule {}
