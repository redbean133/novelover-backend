import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisService } from '../redis/redis.service';
import { ChapterService } from '../chapter/chapter.service';
import { NovelService } from '../novel/novel.service';

@Injectable()
export class ScheduleTasksService {
  constructor(
    private readonly redisService: RedisService,
    private readonly chapterService: ChapterService,
    private readonly novelService: NovelService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncViews() {
    const redis = this.redisService.getClient();

    const keys = await redis.keys('*:views');
    if (keys.length === 0) return;

    const pipeline = redis.pipeline();
    const keyValuePairs = await redis.mget(keys);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = parseInt(keyValuePairs[i] || '0', 10);
      if (value === 0) continue;

      if (key.startsWith('chapter:')) {
        const chapterId = key.split(':')[1];
        await this.chapterService.updateCounter(
          Number(chapterId),
          'numberOfViews',
          value,
        );
      } else if (key.startsWith('novel:')) {
        const novelId = key.split(':')[1];
        await this.novelService.updateCounter(
          Number(novelId),
          'numberOfViews',
          value,
        );
      }

      pipeline.del(key);
    }

    await pipeline.exec();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncVotes() {
    const redis = this.redisService.getClient();

    const keys = await redis.keys('*:votes');
    if (keys.length === 0) return;

    const pipeline = redis.pipeline();
    const keyValuePairs = await redis.mget(keys);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = parseInt(keyValuePairs[i] || '0', 10);
      if (value === 0) continue;

      if (key.startsWith('chapter:')) {
        const chapterId = key.split(':')[1];
        await this.chapterService.updateCounter(
          Number(chapterId),
          'numberOfVotes',
          value,
        );
      } else if (key.startsWith('novel:')) {
        const novelId = key.split(':')[1];
        await this.novelService.updateCounter(
          Number(novelId),
          'numberOfVotes',
          value,
        );
      }

      pipeline.del(key);
    }

    await pipeline.exec();
  }
}
