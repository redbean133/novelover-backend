import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from './dto/createChapter.dto';
import { UpdateChapterDto } from './dto/updateChapter.dto';

@Controller()
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @MessagePattern({ cmd: 'chapter.create' })
  create(@Payload() payload: { dto: CreateChapterDto; currentUserId: string }) {
    return this.chapterService.create(payload.dto, payload.currentUserId);
  }

  @MessagePattern({ cmd: 'chapter.find-one' })
  findOne(@Payload() payload: { chapterId: number; currentUserId: string }) {
    return this.chapterService.findOne(
      payload.chapterId,
      payload.currentUserId,
    );
  }

  @MessagePattern({ cmd: 'chapter.find-all' })
  findAll(
    @Payload()
    payload: {
      query: {
        novelId: number;
        page?: number;
        limit?: number;
        sort?: 'ASC' | 'DESC';
      };
      currentUserId: string;
    },
  ) {
    return this.chapterService.findAll(payload.query, payload.currentUserId);
  }

  @MessagePattern({ cmd: 'chapter.update' })
  update(
    @Payload()
    payload: {
      chapterId: number;
      dto: UpdateChapterDto;
      currentUserId: string;
    },
  ) {
    return this.chapterService.update(
      payload.chapterId,
      payload.dto,
      payload.currentUserId,
    );
  }

  @MessagePattern({ cmd: 'chapter.delete' })
  delete(@Payload() payload: { chapterId: number; currentUserId: string }) {
    return this.chapterService.delete(payload.chapterId, payload.currentUserId);
  }
}
