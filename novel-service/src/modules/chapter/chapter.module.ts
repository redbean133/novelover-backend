import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './chapter.entity';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { NovelModule } from '../novel/novel.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter]), NovelModule],
  providers: [ChapterService],
  controllers: [ChapterController],
  exports: [ChapterService],
})
export class ChapterModule {}
