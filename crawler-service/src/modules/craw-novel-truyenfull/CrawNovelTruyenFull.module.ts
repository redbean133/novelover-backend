import { Module } from '@nestjs/common';
import { CrawNovelTruyenFullService } from './CrawNovelTruyenFull.service';
import { CrawNovelTruyenFullController } from './CrawNovelTruyenFull.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [CrawNovelTruyenFullService],
  controllers: [CrawNovelTruyenFullController],
})
export class CrawNovelTruyenFullModule {}
