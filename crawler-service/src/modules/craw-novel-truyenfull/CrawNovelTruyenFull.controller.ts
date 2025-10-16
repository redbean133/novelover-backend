import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CrawNovelTruyenFullService } from './CrawNovelTruyenFull.service';

@Controller()
export class CrawNovelTruyenFullController {
  constructor(
    private readonly crawNovelTruyenFullService: CrawNovelTruyenFullService,
  ) {}

  @MessagePattern({ cmd: 'crawler.truyen-full.crawl-novel-list' })
  crawlNovelList(
    @Payload()
    payload: {
      currentUserId: string;
      url: string;
    },
  ) {
    return this.crawNovelTruyenFullService.crawlNovelList(
      payload.currentUserId,
      payload.url,
    );
  }

  @MessagePattern({ cmd: 'crawler.truyen-full.crawl-novel-detail' })
  crawlNovelDetail(
    @Payload()
    payload: {
      currentUserId: string;
      url: string;
    },
  ) {
    return this.crawNovelTruyenFullService.crawlNovelDetail(
      payload.currentUserId,
      payload.url,
    );
  }
}
