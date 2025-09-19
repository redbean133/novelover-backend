import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { ProfileModule } from './modules/profile/profile.module';
import { NovelModule } from './modules/novel/novel.module';
import { AuthorModule } from './modules/author/author.module';
import { GenreModule } from './modules/genre/genre.module';
import { ChapterModule } from './modules/chapter/chapter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    ProfileModule,
    NovelModule,
    AuthorModule,
    GenreModule,
    ChapterModule,
  ],
})
export class ApiGatewayModule {}
