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
import { CreateNovelDto } from './dto/createNovel.dto';
import { UpdateNovelDto } from './dto/updateNovel.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import type { IRequestWithUser } from 'src/common/interface/IRequestWithUser';
import { MediaService } from '../media/media.service';
import { MyNovelService } from './myNovel.service';
import { PublishNovelDto } from './dto/publishNovel.dto';
import { CompleteNovelDto } from './dto/completeNovel.dto';

@Controller('/my-novels')
export class MyNovelController {
  constructor(
    private readonly myNovelService: MyNovelService,
    private readonly mediaService: MediaService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Req() req: IRequestWithUser, @Body() dto: CreateNovelDto) {
    return this.myNovelService.create({
      ...dto,
      contributorId: req.user.sub,
    });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Req() req: IRequestWithUser,
    @Param('id', ParseIntPipe) novelId: number,
    @Body() dto: UpdateNovelDto,
  ) {
    return this.myNovelService.update({
      id: novelId,
      currentUserId: req.user.sub,
      data: dto,
    });
  }

  @UseGuards(AuthGuard)
  @Patch(':id/publish')
  publish(
    @Req() req: IRequestWithUser,
    @Param('id', ParseIntPipe) novelId: number,
    @Body() dto: PublishNovelDto,
  ) {
    return this.myNovelService.publish({
      id: novelId,
      currentUserId: req.user.sub,
      ...dto,
    });
  }

  @UseGuards(AuthGuard)
  @Patch(':id/complete')
  complete(
    @Req() req: IRequestWithUser,
    @Param('id', ParseIntPipe) novelId: number,
    @Body() dto: CompleteNovelDto,
  ) {
    return this.myNovelService.complete({
      id: novelId,
      currentUserId: req.user.sub,
      ...dto,
    });
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(
    @Req() req: IRequestWithUser,
    @Param('id', ParseIntPipe) novelId: number,
  ) {
    return this.myNovelService.delete({
      id: novelId,
      currentUserId: req.user.sub,
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
      this.mediaService.uploadMedia(
        file.buffer,
        'novel-cover',
        'image',
        `novel-${novelId}-cover`,
      ),
    );

    return this.myNovelService.update({
      id: novelId,
      currentUserId: req.user.sub,
      data: { coverUrl: uploadResult.url },
    });
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Req() req: IRequestWithUser,
    @Query('status') status: 'published' | 'draft' = 'published',
    @Query('page') page = 1,
    @Query('limit') limit = 12,
  ) {
    return this.myNovelService.findAll({
      contributorId: req.user.sub,
      status,
      page,
      limit,
    });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(
    @Req() req: IRequestWithUser,
    @Param('id', ParseIntPipe) novelId: number,
  ) {
    return this.myNovelService.findOne({
      contributorId: req.user.sub,
      novelId,
    });
  }
}
