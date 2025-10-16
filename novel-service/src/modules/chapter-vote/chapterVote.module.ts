import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChapterVote } from './chapterVote.entity';
import { ChapterVoteService } from './chapterVote.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChapterVote])],
  providers: [ChapterVoteService],
  exports: [ChapterVoteService],
})
export class ChapterVoteModule {}
