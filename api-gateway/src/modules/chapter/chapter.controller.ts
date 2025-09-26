import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChapterService } from './chapter.service';

@Controller('/chapters')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.chapterService.findOne(id);
  }

  @Get()
  findAll(
    @Query('novelId') novelId?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: 'ASC' | 'DESC',
  ) {
    return this.chapterService.findAll({ novelId, page, limit, sort });
  }

  @Get(':id/audio')
  findAudio(@Param('id') id: number) {
    return this.chapterService.findAudio(id);
  }
}
