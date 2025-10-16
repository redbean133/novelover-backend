import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CrawNovelTruyenFullModule } from './modules/craw-novel-truyenfull/CrawNovelTruyenFull.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CrawNovelTruyenFullModule,
  ],
})
export class AppModule {}
