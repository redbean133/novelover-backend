import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChapterService } from './chapter.service';

@Controller()
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @MessagePattern({ cmd: 'chapter.find-one' })
  findOne(
    @Payload()
    payload: {
      chapterId: number;
    },
  ) {
    return this.chapterService.findOne(payload.chapterId);
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
    },
  ) {
    return this.chapterService.findAll(payload.query);
  }
}
