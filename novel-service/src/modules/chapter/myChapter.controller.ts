import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateChapterDto } from './dto/createChapter.dto';
import { UpdateChapterDto } from './dto/updateChapter.dto';
import { MyChapterService } from './myChapter.service';

@Controller()
export class MyChapterController {
  constructor(private readonly myChapterService: MyChapterService) {}

  @MessagePattern({ cmd: 'chapter.create' })
  create(
    @Payload()
    payload: {
      dto: CreateChapterDto;
      currentUserId: string;
    },
  ) {
    return this.myChapterService.create(payload.dto, payload.currentUserId);
  }

  @MessagePattern({ cmd: 'chapter.own.find-one' })
  findOne(
    @Payload()
    payload: {
      chapterId: number;
      currentUserId: string;
    },
  ) {
    return this.myChapterService.findOne(
      payload.chapterId,
      payload.currentUserId,
    );
  }

  @MessagePattern({ cmd: 'chapter.own.find-all' })
  findAll(
    @Payload()
    payload: {
      query: {
        novelId: number;
        page?: number;
        limit?: number;
        sort?: 'ASC' | 'DESC';
        isPublishedOnly?: boolean;
      };
      currentUserId: string;
    },
  ) {
    return this.myChapterService.findAll(payload.query, payload.currentUserId);
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
    return this.myChapterService.update(
      payload.chapterId,
      payload.dto,
      payload.currentUserId,
    );
  }

  @MessagePattern({ cmd: 'chapter.delete' })
  delete(@Payload() payload: { chapterId: number; currentUserId: string }) {
    return this.myChapterService.delete(
      payload.chapterId,
      payload.currentUserId,
    );
  }
}
