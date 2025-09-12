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
import { OptionalAuthGuard } from 'src/common/guard/optionalAuth.guard';
import { CurrentUserId } from 'src/common/decorator/currentUserId.decorator';

@Controller('/novels')
export class NovelController {
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
