import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '../redis/redis.module';
import { NovelModule } from '../novel/novel.module';
import { ChapterModule } from '../chapter/chapter.module';
import { ScheduleTasksService } from './scheduleTasks.service';

@Module({
  imports: [ScheduleModule.forRoot(), RedisModule, NovelModule, ChapterModule],
  providers: [ScheduleTasksService],
})
export class ScheduleTasksModule {}
