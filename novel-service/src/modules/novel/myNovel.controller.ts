import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateNovelDto } from './dto/createNovel.dto';
import { UpdateNovelDto } from './dto/updateNovel.dto';
import { MyNovelService } from './myNovel.service';
import { CrawlerNovelDto } from './dto/crawlerNovel.dto';

@Controller()
export class MyNovelController {
  constructor(private readonly myNovelService: MyNovelService) {}

  @MessagePattern({ cmd: 'novel.create' })
  create(@Payload() dto: CreateNovelDto) {
    return this.myNovelService.create(dto);
  }

  @MessagePattern({ cmd: 'novel.create-from-crawler' })
  createFromCrawler(@Payload() dto: CrawlerNovelDto) {
    return this.myNovelService.createFromCrawler(dto);
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
    return this.myNovelService.update(
      payload.id,
      payload.currentUserId,
      payload.data,
    );
  }

  @MessagePattern({ cmd: 'novel.publish' })
  publish(
    @Payload()
    payload: {
      id: number;
      currentUserId: string;
      isPublished: boolean;
    },
  ) {
    return this.myNovelService.publish(
      payload.id,
      payload.currentUserId,
      payload.isPublished,
    );
  }

  @MessagePattern({ cmd: 'novel.complete' })
  complete(
    @Payload()
    payload: {
      id: number;
      currentUserId: string;
      isCompleted: boolean;
    },
  ) {
    return this.myNovelService.complete(
      payload.id,
      payload.currentUserId,
      payload.isCompleted,
    );
  }

  @MessagePattern({ cmd: 'novel.delete' })
  delete(@Payload() payload: { id: number; currentUserId: string }) {
    return this.myNovelService.delete(payload.id, payload.currentUserId);
  }

  @MessagePattern({ cmd: 'novel.own.find-all' })
  findAll(payload: {
    contributorId: string;
    status: 'published' | 'draft';
    page: number;
    limit: number;
  }) {
    return this.myNovelService.findAll(payload);
  }

  @MessagePattern({ cmd: 'novel.own.find-one' })
  findOne(payload: { contributorId: string; novelId: number }) {
    return this.myNovelService.findOne({
      id: payload.novelId,
      currentUserId: payload.contributorId,
    });
  }
}
