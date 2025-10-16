import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import type { IRequestWithUser } from 'src/common/interface/IRequestWithUser';

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

  @UseGuards(AuthGuard)
  @Get(':id/vote-status')
  checkVote(@Req() req: IRequestWithUser, @Param('id') id: number) {
    return this.chapterService.checkVote(id, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post(':id/vote')
  vote(@Req() req: IRequestWithUser, @Param('id') id: number) {
    return this.chapterService.vote(id, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete(':id/vote')
  unvote(@Req() req: IRequestWithUser, @Param('id') id: number) {
    return this.chapterService.unvote(id, req.user.sub);
  }
}
