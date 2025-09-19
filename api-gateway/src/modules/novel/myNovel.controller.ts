import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ParseFilePipe, FileTypeValidator } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { NovelService } from './novel.service';
import { CreateNovelDto } from './dto/createNovel.dto';
import { UpdateNovelDto } from './dto/updateNovel.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import type { IRequestWithUser } from 'src/common/interface/IRequestWithUser';
import { MediaService } from '../media/media.service';

@Controller('/my-novels')
export class MyNovelController {
  constructor(
    private readonly novelService: NovelService,
    private readonly mediaService: MediaService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  createNovel(@Req() req: IRequestWithUser, @Body() dto: CreateNovelDto) {
    return this.novelService.createNovel({
      ...dto,
      contributorId: req.user.sub,
    });
  }

  @UseGuards(AuthGuard)
  @Get()
  getMyNovels(
    @Req() req: IRequestWithUser,
    @Query('status') status: 'published' | 'draft' | 'all' = 'published',
    @Query('page') page = 1,
    @Query('limit') limit = 12,
  ) {
    return this.novelService.findAllByContributor({
      contributorId: req.user.sub,
      status,
      page,
      limit,
    });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  updateNovel(
    @Req() req: IRequestWithUser,
    @Param('id', ParseIntPipe) novelId: number,
    @Body() dto: UpdateNovelDto,
  ) {
    return this.novelService.updateNovel({
      id: novelId,
      currentUserId: req.user.sub,
      data: dto,
    });
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteNovel(
    @Req() req: IRequestWithUser,
    @Param('id', ParseIntPipe) novelId: number,
  ) {
    return this.novelService.deleteNovel({
      id: novelId,
      currentUserId: req.user.sub,
    });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  getMyNovelDetail(
    @Req() req: IRequestWithUser,
    @Param('id', ParseIntPipe) novelId: number,
  ) {
    return this.novelService.getDetailByContributor({
      contributorId: req.user.sub,
      novelId,
    });
  }

  @UseGuards(AuthGuard)
  @Patch(':id/upload-cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(
    @Req() req: IRequestWithUser,
    @Param('id', ParseIntPipe) novelId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /^image\// })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const uploadResult = await firstValueFrom(
      this.mediaService.uploadMedia(file, 'novel-cover'),
    );

    return this.novelService.updateNovel({
      id: novelId,
      currentUserId: req.user.sub,
      data: { coverUrl: uploadResult.url },
    });
  }
}
