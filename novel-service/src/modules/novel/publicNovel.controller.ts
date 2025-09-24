import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PublicNovelService } from './publicNovel.service';

@Controller()
export class PublicNovelController {
  constructor(private readonly publicNovelService: PublicNovelService) {}

  @MessagePattern({ cmd: 'novel.published.find-all' })
  findAll(payload: {
    page?: number;
    limit?: number;
    genreId?: number;
    contributorId?: string;
    search?: string;
    status?: 'published' | 'draft';
  }) {
    return this.publicNovelService.findAll(payload);
  }

  @MessagePattern({ cmd: 'novel.published.find-one' })
  findOne(payload: { id: number }) {
    return this.publicNovelService.findOne(payload.id);
  }
}
