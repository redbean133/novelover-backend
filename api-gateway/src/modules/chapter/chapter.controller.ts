import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateChapterDto } from './dto/createChapter.dto';
import { UpdateChapterDto } from './dto/updateChapter.dto';
import { ChapterService } from './chapter.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import type { IRequestWithUser } from 'src/common/interface/IRequestWithUser';

@UseGuards(AuthGuard)
@Controller('/chapters')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post()
  create(@Req() req: IRequestWithUser, @Body() dto: CreateChapterDto) {
    return this.chapterService.create(dto, req.user.sub);
  }

  @Get(':id')
  findOne(@Req() req: IRequestWithUser, @Param('id') id: number) {
    return this.chapterService.findOne(id, req.user.sub);
  }

  @Get()
  findAll(
    @Req() req: IRequestWithUser,
    @Query('novelId') novelId?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: 'ASC' | 'DESC',
  ) {
    return this.chapterService.findAll(
      { novelId, page, limit, sort },
      req.user.sub,
    );
  }

  @Patch(':id')
  update(
    @Req() req: IRequestWithUser,
    @Param('id') id: number,
    @Body() dto: UpdateChapterDto,
  ) {
    return this.chapterService.update(id, dto, req.user.sub);
  }

  @Delete(':id')
  delete(@Req() req: IRequestWithUser, @Param('id') id: number) {
    return this.chapterService.delete(id, req.user.sub);
  }
}
