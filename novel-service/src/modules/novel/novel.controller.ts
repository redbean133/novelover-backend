import { Controller } from '@nestjs/common';
import { NovelService } from './novel.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateNovelDto } from './dto/createNovel.dto';
import { UpdateNovelDto } from './dto/updateNovel.dto';

@Controller()
export class NovelController {
  constructor(private readonly novelService: NovelService) {}

  @MessagePattern({ cmd: 'novel.create' })
  create(@Payload() dto: CreateNovelDto) {
    return this.novelService.create(dto);
  }

  @MessagePattern({ cmd: 'novel.update' })
  update(
    @Payload()
    payload: {
      id: number;
      currentUserId: string;
      data: UpdateNovelDto;
    },
  ) {
    return this.novelService.update(
      payload.id,
      payload.currentUserId,
      payload.data,
    );
  }

  @MessagePattern({ cmd: 'novel.delete' })
  delete(@Payload() payload: { id: number; currentUserId: string }) {
    return this.novelService.delete(payload.id, payload.currentUserId);
  }

  @MessagePattern({ cmd: 'novel.find-all' })
  findAll(@Payload() query: any) {
    return this.novelService.findAll(query);
  }

  @MessagePattern({ cmd: 'novel.find-one' })
  findOne(@Payload() payload: { id: number; isPublishedOnly?: boolean }) {
    return this.novelService.findOne(payload);
  }

  @MessagePattern({ cmd: 'novel.find-all-by-contributor' })
  findAllByContributor(payload: {
    contributorId: string;
    status: 'published' | 'draft' | 'all';
    page: number;
    limit: number;
  }) {
    return this.novelService.findAll(payload);
  }

  @MessagePattern({ cmd: 'novel.get-detail-by-contributor' })
  getDetailByContributor(payload: { contributorId: string; novelId: number }) {
    return this.novelService.getDetailByContributor(payload);
  }
}
