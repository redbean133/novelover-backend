import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PublicNovelService } from './publicNovel.service';

@Controller('/novels')
export class PublicNovelController {
  constructor(private readonly publicNovelService: PublicNovelService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('genreId') genreIdsParam?: number[],
    @Query('contributorId') contributorId?: string,
    @Query('completionStatus') completionStatus?: 'completed' | 'ongoing',
    @Query('source') source?: 'original' | 'collected',
    @Query('sort') sort?: 'ASC' | 'DESC',
    @Query('sortBy')
    sortBy?:
      | 'latestPublishedChapterTime'
      | 'numberOfViews'
      | 'numberOfVotes'
      | 'averageRating',
  ) {
    const genreIds = Array.isArray(genreIdsParam)
      ? genreIdsParam.map((id) => Number(id))
      : genreIdsParam
        ? [Number(genreIdsParam)]
        : [];

    return this.publicNovelService.findAll({
      page,
      limit,
      search,
      genreIds,
      contributorId,
      completionStatus,
      source,
      sort,
      sortBy,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) novelId: number) {
    return this.publicNovelService.findOne(novelId);
  }
}
