import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { CrawlerService } from './crawler.service';
import type { IRequestWithUser } from 'src/common/interface/IRequestWithUser';

@Controller('/crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Post('/novel-list')
  crawlNovelList(
    @Req() req: IRequestWithUser,
    @Body() dto: { source: string; url: string },
  ) {
    return this.crawlerService.crawlNovelList(
      req.user.sub,
      dto.source,
      dto.url,
    );
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('/novel-detail')
  crawlNovelDetail(
    @Req() req: IRequestWithUser,
    @Body() dto: { source: string; url: string },
  ) {
    return this.crawlerService.crawlNovelDetail(
      req.user.sub,
      dto.source,
      dto.url,
    );
  }
}
