import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChapterService } from './chapter.service';
import { ChapterVoteService } from '../chapter-vote/chapterVote.service';

@Controller()
export class ChapterController {
  constructor(
    private readonly chapterService: ChapterService,
    private readonly chapterVoteService: ChapterVoteService,
  ) {}

  @MessagePattern({ cmd: 'chapter.find-one' })
  findOne(
    @Payload()
    payload: {
      chapterId: number;
    },
  ) {
    return this.chapterService.findOne(payload.chapterId);
  }

  @MessagePattern({ cmd: 'chapter.find-all' })
  findAll(
    @Payload()
    payload: {
      query: {
        novelId: number;
        page?: number;
        limit?: number;
        sort?: 'ASC' | 'DESC';
      };
    },
  ) {
    return this.chapterService.findAll(payload.query);
  }

  @MessagePattern({ cmd: 'chapter.update-audio' })
  updateAudio(
    @Payload()
    payload: {
      chapterId: number;
      audioUrl: string;
    },
  ) {
    return this.chapterService.updateAudio(payload.chapterId, payload.audioUrl);
  }

  @MessagePattern({ cmd: 'chapter.check-vote' })
  async checkVote(@Payload() payload: { chapterId: number; userId: string }) {
    return this.chapterVoteService.checkVote(payload.chapterId, payload.userId);
  }

  @MessagePattern({ cmd: 'chapter.vote' })
  async voteChapter(@Payload() payload: { chapterId: number; userId: string }) {
    const chapter = await this.chapterService.findBasicById(payload.chapterId);
    return this.chapterVoteService.vote(
      chapter.novelId,
      payload.chapterId,
      payload.userId,
    );
  }

  @MessagePattern({ cmd: 'chapter.unvote' })
  async unvoteChapter(
    @Payload() payload: { chapterId: number; userId: string },
  ) {
    const chapter = await this.chapterService.findBasicById(payload.chapterId);
    return this.chapterVoteService.unvote(
      chapter.novelId,
      payload.chapterId,
      payload.userId,
    );
  }
}
