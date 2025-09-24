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
import type { IRequestWithUser } from 'src/common/interface/IRequestWithUser';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { MyChapterService } from './myChapter.service';

@UseGuards(AuthGuard)
@Controller('/my-chapters')
export class MyChapterController {
  constructor(private readonly myChapterService: MyChapterService) {}

  @Post()
  create(@Req() req: IRequestWithUser, @Body() dto: CreateChapterDto) {
    return this.myChapterService.create(dto, req.user.sub);
  }

  @Patch(':id')
  update(
    @Req() req: IRequestWithUser,
    @Param('id') id: number,
    @Body() dto: UpdateChapterDto,
  ) {
    return this.myChapterService.update(id, dto, req.user.sub);
  }

  @Delete(':id')
  delete(@Req() req: IRequestWithUser, @Param('id') id: number) {
    return this.myChapterService.delete(id, req.user.sub);
  }

  @Get(':id')
  findOne(@Req() req: IRequestWithUser, @Param('id') id: number) {
    return this.myChapterService.findOne(id, req.user.sub);
  }

  @Get()
  findAll(
    @Req() req: IRequestWithUser,
    @Query('novelId') novelId?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: 'ASC' | 'DESC',
    @Query('isPublishedOnly') isPublishedOnly?: boolean,
  ) {
    return this.myChapterService.findAll(
      { novelId, page, limit, sort, isPublishedOnly },
      req.user.sub,
    );
  }
}
