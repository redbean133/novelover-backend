import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CrawlerService {
  constructor(
    @Inject('CRAWLER_SERVICE')
    private readonly crawlerServiceClient: ClientProxy,
  ) {}

  crawlNovelList(currentUserId: string, source: string, url: string) {
    return this.crawlerServiceClient.send(
      { cmd: `crawler.${source}.crawl-novel-list` },
      { currentUserId, url },
    );
  }

  crawlNovelDetail(currentUserId: string, source: string, url: string) {
    return this.crawlerServiceClient.send(
      { cmd: `crawler.${source}.crawl-novel-detail` },
      { currentUserId, url },
    );
  }
}
