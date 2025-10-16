import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PublicNovelService } from './publicNovel.service';

@Controller()
export class PublicNovelController {
  constructor(private readonly publicNovelService: PublicNovelService) {}

  @MessagePattern({ cmd: 'novel.published.find-all' })
  findAll(payload: {
    page?: number;
    limit?: number;
    search?: string;
    genreIds?: number[];
    contributorId?: string;
    completionStatus?: 'completed' | 'ongoing';
    source?: 'original' | 'collected';
    sort?: 'ASC' | 'DESC';
    sortBy?:
      | 'latestPublishedChapterTime'
      | 'numberOfViews'
      | 'numberOfVotes'
      | 'averageRating';
  }) {
    return this.publicNovelService.findAll(payload);
  }

  @MessagePattern({ cmd: 'novel.published.find-one' })
  findOne(payload: { id: number }) {
    return this.publicNovelService.findOne(payload.id);
  }
}
