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
    @Query('genreId') genreId?: number,
    @Query('contributorId') contributorId?: string,
  ) {
    return this.publicNovelService.findAll({
      page,
      limit,
      search,
      genreId,
      contributorId,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) novelId: number) {
    return this.publicNovelService.findOne(novelId);
  }
}
