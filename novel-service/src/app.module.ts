import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NovelModule } from './modules/novel/novel.module';
import databaseConfig from './config/database.config';
import { AuthorModule } from './modules/author/author.module';
import { GenreModule } from './modules/genre/genre.module';
import { ChapterModule } from './modules/chapter/chapter.module';
import { ReviewModule } from './modules/review/review.module';
import { RedisModule } from './modules/redis/redis.module';
import { ScheduleTasksModule } from './modules/schedule-task/scheduleTasks.module';
import { CommentModule } from './modules/comment/comment.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        ...configService.get<TypeOrmModuleOptions>('database'),
      }),
    }),
    NovelModule,
    AuthorModule,
    GenreModule,
    ChapterModule,
    ReviewModule,
    RedisModule,
    ScheduleTasksModule,
    CommentModule,
  ],
})
export class AppModule {}
