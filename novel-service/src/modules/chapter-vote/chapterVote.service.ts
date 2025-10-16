import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChapterVote } from './chapterVote.entity';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ChapterVoteService {
  constructor(
    @InjectRepository(ChapterVote)
    private readonly chapterVoteRepo: Repository<ChapterVote>,
    private readonly redisService: RedisService,
  ) {}

  async checkVote(chapterId: number, userId: string) {
    const hasVoted = await this.chapterVoteRepo.exists({
      where: { chapterId, userId },
    });
    return { hasVoted };
  }

  async vote(novelId: number, chapterId: number, userId: string) {
    const existed = await this.chapterVoteRepo.exists({
      where: { chapterId, userId },
    });
    if (existed) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Đã vote chương này rồi`,
      });
    }

    await this.chapterVoteRepo.insert({ chapterId, userId });
    void this.redisService.increment(`chapter:${chapterId}:votes`);
    void this.redisService.increment(`novel:${novelId}:votes`);
    return { success: true, hasVoted: true };
  }

  async unvote(novelId: number, chapterId: number, userId: string) {
    const result = await this.chapterVoteRepo.delete({ chapterId, userId });
    if (!result.affected) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Chưa vote chương này`,
      });
    }

    void this.redisService.decrement(`chapter:${chapterId}:votes`);
    void this.redisService.decrement(`novel:${novelId}:votes`);
    return { success: true, hasVoted: false };
  }
}
