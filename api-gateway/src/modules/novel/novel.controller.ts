import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NovelService } from './novel.service';
import { OptionalAuthGuard } from 'src/common/guard/optionalAuth.guard';
import { CurrentUserId } from 'src/common/decorator/currentUserId.decorator';

@Controller('/novels')
export class NovelController {
  constructor(private readonly novelService: NovelService) {}

  @UseGuards(OptionalAuthGuard)
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('genreId') genreId?: number,
    @Query('contributorId') contributorId?: string,
    @CurrentUserId() currentUserId?: string | null,
  ) {
    return this.novelService.findAll({
      page,
      limit,
      search,
      genreId,
      contributorId,
      currentUserId,
    });
  }

  @UseGuards(OptionalAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) novelId: number,
    @CurrentUserId() currentUserId?: string | null,
  ) {
    return this.novelService.findOne({
      id: novelId,
      currentUserId,
    });
  }
}
